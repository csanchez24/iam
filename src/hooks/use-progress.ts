import * as React from 'react';

export const useProgress = ({ enabled }: { enabled: boolean }) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (enabled) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, 100);

      return () => {
        clearInterval(timer);
      };
    }

    if (progress > 0) {
      return setProgress(0);
    }
  }, [enabled, progress]);

  return { progress };
};
