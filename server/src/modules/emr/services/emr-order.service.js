import prisma from "../../config/database.js";
import { OrderStatus } from "@prisma/client";
import { recordOrderCreated, recordOrderCancelled } from "./emr-audit.service.js";

/**
 * Create an order for an encounter
 */
export async function createOrder(encounterId, data, user, ipAddress, userAgent) {
  const { orderType, itemCode, description, priority, targetModule, notes } = data;

  // Verify encounter exists and is open/in-progress
  const encounter = await prisma.emrEncounter.findUnique({
    where: { id: encounterId },
    include: { patient: true }
  });

  if (!encounter) {
    throw new Error("Encounter not found");
  }

  if (encounter.status === 'CLOSED' || encounter.status === 'CANCELLED') {
    throw new Error("Cannot create order for closed or cancelled encounter");
  }

  // Create order in DRAFT status
  const order = await prisma.emrOrder.create({
    data: {
      encounterId,
      orderType,
      itemCode,
      description,
      priority: priority || 'ROUTINE',
      targetModule,
      notes,
      orderStatus: OrderStatus.DRAFT,
      orderedById: user?.id
    },
    include: {
      encounter: {
        include: {
          patient: true
        }
      },
      orderedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  // Audit log
  await recordOrderCreated(
    encounterId,
    encounter.patientId,
    user?.id,
    "EmrOrder",
    order.id,
    null,
    { orderType, itemCode, description, priority, targetModule, notes },
    ipAddress,
    userAgent
  );

  return order;
}

/**
 * Get orders for an encounter
 */
export async function getOrders(encounterId, filters = {}) {
  const { orderType, orderStatus } = filters;

  const where = { encounterId };
  
  if (orderType) {
    where.orderType = orderType;
  }
  
  if (orderStatus) {
    where.orderStatus = orderStatus;
  }

  const orders = await prisma.emrOrder.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      orderedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      cancelledBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return orders;
}

/**
 * Get a specific order
 */
export async function getOrder(orderId) {
  const order = await prisma.emrOrder.findUnique({
    where: { id: orderId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      },
      orderedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      cancelledBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
}

/**
 * Submit an order (send to target module)
 */
export async function submitOrder(orderId, user, ipAddress, userAgent) {
  const order = await prisma.emrOrder.findUnique({
    where: { id: orderId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.orderStatus !== OrderStatus.DRAFT) {
    throw new Error("Only draft orders can be submitted");
  }

  const previousValues = { orderStatus: order.orderStatus };

  // Submit the order
  const submittedOrder = await prisma.emrOrder.update({
    where: { id: orderId },
    data: {
      orderStatus: OrderStatus.ORDERED,
      orderedAt: new Date()
    }
  });

  // Audit log
  await recordOrderCreated(
    order.encounterId,
    order.patientId,
    user?.id,
    "EmrOrder",
    orderId,
    previousValues,
    { orderStatus: OrderStatus.ORDERED, orderedAt: new Date() },
    ipAddress,
    userAgent
  );

  // TODO: Integrate with target modules (Lab, Radiology, Pharmacy)
  // This would create records in those modules based on orderType

  return submittedOrder;
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId, reason, user, ipAddress, userAgent) {
  const order = await prisma.emrOrder.findUnique({
    where: { id: orderId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.orderStatus === OrderStatus.CANCELLED) {
    throw new Error("Order is already cancelled");
  }

  if (order.orderStatus === OrderStatus.COMPLETED) {
    throw new Error("Cannot cancel a completed order");
  }

  // Check if order has been processed by target module
  // For MVP, we allow cancellation of ORDERED and IN_PROGRESS orders
  // In production, you'd check the target module status

  const previousValues = { 
    orderStatus: order.orderStatus,
    orderedAt: order.orderedAt
  };

  // Cancel the order
  const cancelledOrder = await prisma.emrOrder.update({
    where: { id: orderId },
    data: {
      orderStatus: OrderStatus.CANCELLED,
      cancelledById: user?.id,
      cancelledAt: new Date(),
      cancellationReason: reason
    }
  });

  // Audit log
  await recordOrderCancelled(
    order.encounterId,
    order.patientId,
    user?.id,
    "EmrOrder",
    orderId,
    previousValues,
    { 
      orderStatus: OrderStatus.CANCELLED,
      cancelledById: user?.id,
      cancellationReason: reason
    },
    ipAddress,
    userAgent
  );

  return cancelledOrder;
}

/**
 * Update order status (used by target modules)
 */
export async function updateOrderStatus(orderId, newStatus, user, ipAddress, userAgent) {
  const order = await prisma.emrOrder.findUnique({
    where: { id: orderId },
    include: {
      encounter: {
        include: {
          patient: true
        }
      }
    }
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const validTransitions = {
    [OrderStatus.DRAFT]: [OrderStatus.ORDERED],
    [OrderStatus.ORDERED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
    [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED]
  };

  if (!validTransitions[order.orderStatus]?.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${order.orderStatus} to ${newStatus}`);
  }

  const previousValues = { orderStatus: order.orderStatus };

  const updateData = { orderStatus: newStatus };
  
  if (newStatus === OrderStatus.COMPLETED) {
    updateData.completedAt = new Date();
  }

  const updatedOrder = await prisma.emrOrder.update({
    where: { id: orderId },
    data: updateData
  });

  // Audit log
  await recordOrderCreated(
    order.encounterId,
    order.patientId,
    user?.id,
    "EmrOrder",
    orderId,
    previousValues,
    { orderStatus: newStatus },
    ipAddress,
    userAgent
  );

  return updatedOrder;
}

/**
 * Get pending orders across all encounters
 */
export async function getPendingOrders(orderType) {
  const where = {
    orderStatus: {
      in: [OrderStatus.ORDERED, OrderStatus.IN_PROGRESS]
    }
  };

  if (orderType) {
    where.orderType = orderType;
  }

  const orders = await prisma.emrOrder.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      encounter: {
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hospitalNumber: true
            }
          }
        }
      },
      orderedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return orders;
}
