import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { debtorsApi } from '../../api/debtors.api';
import { debtorKeys } from '../../hooks/useDebtors';

export default function DebtorAccountFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    debtorType: 'INSURANCE',
    debtorName: '',
    legalName: '',
    taxPin: '',
    registrationNumber: '',
    email: '',
    phone: '',
    website: '',
    physicalAddress: '',
    postalAddress: '',
    city: '',
    country: 'Kenya',
    creditLimit: 0,
    paymentTermsDays: 30,
    billingCycle: 'MONTHLY',
    requiresPreAuthorization: false,
    allowsOutpatientBilling: true,
    allowsInpatientBilling: true,
    allowsPharmacyBilling: true,
    allowsLabBilling: true,
    allowsRadiologyBilling: true,
    accountManagerId: '',
    claimsOfficerId: '',
    notes: ''
  });

  const createMutation = useMutation({
    mutationFn: (data) => debtorsApi.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: debtorKeys.accounts() });
      navigate('/debtors/accounts');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => debtorsApi.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: debtorKeys.account(id) });
      queryClient.invalidateQueries({ queryKey: debtorKeys.accounts() });
      navigate(`/debtors/accounts/${id}`);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      creditLimit: parseFloat(formData.creditLimit) || 0,
      paymentTermsDays: parseInt(formData.paymentTermsDays) || 30
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Debtor Account' : 'New Debtor Account'}
        </h1>
        <button
          onClick={() => navigate(isEdit ? `/debtors/accounts/${id}` : '/debtors/accounts')}
          className="text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Debtor Type *</label>
              <select
                value={formData.debtorType}
                onChange={(e) => handleChange('debtorType', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INSURANCE">Insurance</option>
                <option value="CORPORATE">Corporate</option>
                <option value="DIRECT_CORPORATE">Direct Corporate</option>
                <option value="SHA">SHA</option>
                <option value="NHIF">NHIF</option>
                <option value="NGO">NGO</option>
                <option value="EMBASSY">Embassy</option>
                <option value="GOVERNMENT">Government</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
              <input
                type="text"
                value={formData.debtorName}
                onChange={(e) => handleChange('debtorName', e.target.value)}
                required
                placeholder="e.g., NHIF, Jubilee Insurance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
              <input
                type="text"
                value={formData.legalName}
                onChange={(e) => handleChange('legalName', e.target.value)}
                placeholder="Official registered name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax PIN</label>
              <input
                type="text"
                value={formData.taxPin}
                onChange={(e) => handleChange('taxPin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => handleChange('registrationNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
              <textarea
                value={formData.physicalAddress}
                onChange={(e) => handleChange('physicalAddress', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Address</label>
              <textarea
                value={formData.postalAddress}
                onChange={(e) => handleChange('postalAddress', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Billing Settings */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Billing Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (KES) *</label>
              <input
                type="number"
                value={formData.creditLimit}
                onChange={(e) => handleChange('creditLimit', e.target.value)}
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms (Days)</label>
              <input
                type="number"
                value={formData.paymentTermsDays}
                onChange={(e) => handleChange('paymentTermsDays', e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
              <select
                value={formData.billingCycle}
                onChange={(e) => handleChange('billingCycle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="requiresPreAuth"
                checked={formData.requiresPreAuthorization}
                onChange={(e) => handleChange('requiresPreAuthorization', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="requiresPreAuth" className="ml-2 block text-sm text-gray-700">
                Requires Pre-Authorization
              </label>
            </div>
          </div>
        </div>

        {/* Service Permissions */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Service Permissions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="outpatient"
                checked={formData.allowsOutpatientBilling}
                onChange={(e) => handleChange('allowsOutpatientBilling', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="outpatient" className="ml-2 block text-sm text-gray-700">
                Outpatient Billing
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="inpatient"
                checked={formData.allowsInpatientBilling}
                onChange={(e) => handleChange('allowsInpatientBilling', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="inpatient" className="ml-2 block text-sm text-gray-700">
                Inpatient Billing
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="pharmacy"
                checked={formData.allowsPharmacyBilling}
                onChange={(e) => handleChange('allowsPharmacyBilling', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="pharmacy" className="ml-2 block text-sm text-gray-700">
                Pharmacy Billing
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="lab"
                checked={formData.allowsLabBilling}
                onChange={(e) => handleChange('allowsLabBilling', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="lab" className="ml-2 block text-sm text-gray-700">
                Laboratory Billing
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="radiology"
                checked={formData.allowsRadiologyBilling}
                onChange={(e) => handleChange('allowsRadiologyBilling', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="radiology" className="ml-2 block text-sm text-gray-700">
                Radiology Billing
              </label>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={4}
            placeholder="Additional notes or instructions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/debtors/accounts/${id}` : '/debtors/accounts')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : isEdit ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
