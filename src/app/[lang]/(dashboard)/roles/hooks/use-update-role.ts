'use client';

import { api } from '@/clients/api';
import { useToast } from '@/components/ui/use-toast';
import { invalidateQueries } from '@/utils/query';
import { useQueryClient } from '@tanstack/react-query';
import { getRoleQueryKey } from './use-get-role';
import { getRolesQueryKey } from './use-get-roles';

export const useUpdateRole = ({
  onSuccess,
  onError,
}: { onSuccess?(): void; onError?(): void } = {}) => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  return api.role.update.useMutation({
    async onSuccess({ body }) {
      await queryClient.invalidateQueries({
        predicate: invalidateQueries([[...getRoleQueryKey(body.id), body.id], getRolesQueryKey()]),
      });
      toast({
        description: 'Role was successfully updated.',
      });
      onSuccess?.();
    },
    onError(e) {
      if (e.status === 400 || e.status === 404 || e.status === 500) {
        toast({
          variant: 'destructive',
          title: 'Unable to update role.',
          description: e.body.message,
        });
      } else {
        toast({
          variant: 'destructive',
          description: 'Something went wrong while updating role.',
        });
      }
      onError?.();
    },
  });
};
