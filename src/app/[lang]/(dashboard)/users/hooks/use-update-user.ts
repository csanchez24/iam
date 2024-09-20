'use client';

import { api } from '@/clients/api';
import { useToast } from '@/components/ui/use-toast';
import { invalidateQueries } from '@/utils/query';
import { useQueryClient } from '@tanstack/react-query';
import { getUserQueryKey } from './use-get-user';
import { getUsersQueryKey } from './use-get-users';

export const useUpdateUser = ({
  onSuccess,
  onError,
}: { onSuccess?(): void; onError?(): void } = {}) => {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  return api.user.update.useMutation({
    async onSuccess({ body }) {
      await queryClient.invalidateQueries({
        predicate: invalidateQueries([[...getUserQueryKey(body.id), body.id], getUsersQueryKey()]),
      });
      toast({
        description: 'User was successfully updated.',
      });
      onSuccess?.();
    },
    onError(e) {
      if (e.status === 400 || e.status === 404 || e.status === 500) {
        toast({
          variant: 'destructive',
          title: 'Unable to update user.',
          description: e.body.message,
        });
      } else {
        toast({
          variant: 'destructive',
          description: 'Something went wrong while updating user.',
        });
      }
      onError?.();
    },
  });
};
