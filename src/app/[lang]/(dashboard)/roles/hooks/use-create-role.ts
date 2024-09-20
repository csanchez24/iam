'use client';

import { api } from '@/clients/api';
import { useToast } from '@/components/ui/use-toast';
import { invalidateQueries } from '@/utils/query';
import { useQueryClient } from '@tanstack/react-query';
import { getRolesQueryKey } from './use-get-roles';

export const useCreateRole = ({
  onSuccess,
  onError,
}: { onSuccess?(): void; onError?(): void } = {}) => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  return api.role.create.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({
        predicate: invalidateQueries([getRolesQueryKey()]),
      });
      toast({
        description: 'Role was successfully created.',
      });
      onSuccess?.();
    },
    onError(e) {
      if (e.status === 400 || e.status === 500) {
        toast({
          variant: 'destructive',
          title: 'Unable to create role',
          description: e.body.message,
        });
      } else {
        toast({
          variant: 'destructive',
          description: 'Something went wrong. Try again!',
        });
      }
      onError?.();
    },
  });
};
