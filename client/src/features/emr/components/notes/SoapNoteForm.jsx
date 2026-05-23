import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { useCreateNote, useSignNote, useAmendNote, useVoidNote } from '../../hooks/useEmr';
import { StatusBadge } from '../shared/EmrComponents';

export const SoapNoteForm = ({ encounterId, existingNotes }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const createNote = useCreateNote(encounterId);
  const signNote = useSignNote();
  const amendNote = useAmendNote();
  const voidNote = useVoidNote();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      subjective: '',
      objective: '',
      assessment: '',
      plan: '',
      noteText: '',
    },
  });

  const onSubmit = async (data) => {
    await createNote.mutateAsync(data);
    reset();
    setShowForm(false);
  };

  const handleSign = async (noteId) => {
    if (confirm('Sign this note? It cannot be edited after signing.')) {
      await signNote.mutateAsync(noteId);
    }
  };

  const handleAmend = async (note) => {
    const reason = prompt('Enter amendment reason:');
    if (reason) {
      await amendNote.mutateAsync({ id: note.id, reason });
    }
  };

  const handleVoid = async (note) => {
    const reason = prompt('Enter void reason:');
    if (reason) {
      await voidNote.mutateAsync({ id: note.id, reason });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Clinical Notes</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Note'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>S.O.A.P. Note</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Subjective</Label>
                <Textarea
                  {...register('subjective')}
                  rows={3}
                  placeholder="Patient's complaints, history..."
                />
              </div>

              <div>
                <Label>Objective</Label>
                <Textarea
                  {...register('objective')}
                  rows={3}
                  placeholder="Physical examination findings, vital signs..."
                />
              </div>

              <div>
                <Label>Assessment</Label>
                <Textarea
                  {...register('assessment')}
                  rows={2}
                  placeholder="Clinical impression, diagnosis..."
                />
              </div>

              <div>
                <Label>Plan</Label>
                <Textarea
                  {...register('plan')}
                  rows={3}
                  placeholder="Treatment plan, investigations, follow-up..."
                />
              </div>

              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  {...register('noteText')}
                  rows={3}
                  placeholder="Any additional clinical notes..."
                />
              </div>

              <Button type="submit" disabled={createNote.isPending}>
                {createNote.isPending ? 'Saving...' : 'Save Note'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {existingNotes?.map((note) => (
          <Card key={note.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">
                  Note - {new Date(note.createdAt).toLocaleString()}
                </CardTitle>
                <div className="flex gap-2">
                  <StatusBadge status={note.status} />
                  {note.status === 'DRAFT' && (
                    <Button size="sm" variant="outline" onClick={() => handleSign(note.id)}>
                      Sign
                    </Button>
                  )}
                  {note.status === 'SIGNED' && (
                    <Button size="sm" variant="outline" onClick={() => handleAmend(note)}>
                      Amend
                    </Button>
                  )}
                  {(note.status === 'DRAFT' || note.status === 'SIGNED') && (
                    <Button size="sm" variant="destructive" onClick={() => handleVoid(note)}>
                      Void
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {note.subjective && (
                <div>
                  <span className="font-semibold text-blue-700">S:</span>
                  <p className="text-sm mt-1">{note.subjective}</p>
                </div>
              )}
              {note.objective && (
                <div>
                  <span className="font-semibold text-green-700">O:</span>
                  <p className="text-sm mt-1">{note.objective}</p>
                </div>
              )}
              {note.assessment && (
                <div>
                  <span className="font-semibold text-purple-700">A:</span>
                  <p className="text-sm mt-1">{note.assessment}</p>
                </div>
              )}
              {note.plan && (
                <div>
                  <span className="font-semibold text-orange-700">P:</span>
                  <p className="text-sm mt-1">{note.plan}</p>
                </div>
              )}
              {note.noteText && (
                <div>
                  <p className="text-sm whitespace-pre-wrap">{note.noteText}</p>
                </div>
              )}
              {note.amendmentReason && (
                <div className="pt-3 border-t">
                  <span className="text-yellow-700 text-sm font-medium">Amendment Reason:</span>
                  <p className="text-sm">{note.amendmentReason}</p>
                </div>
              )}
              <div className="pt-2 border-t text-xs text-gray-500">
                Created by: {note.createdBy?.name || 'Unknown'} | 
                {note.signedAt && ` Signed by: ${note.signedBy?.name || 'Unknown'} at ${new Date(note.signedAt).toLocaleString()}`}
              </div>
            </CardContent>
          </Card>
        ))}
        {(!existingNotes || existingNotes.length === 0) && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-center">No clinical notes yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
