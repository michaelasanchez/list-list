import React, { ReactElement } from 'react';
import { Alert } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';
import * as styles from './useAlerts.module.scss';

export interface AlertData {
  content: ReactElement;
  created: Date;
  variant?: Variant | null;
}

export type AlertCreation = Pick<AlertData, 'content' | 'variant'>;

export interface AlertsOptions {
  max?: number;
  duration?: number;
}

export interface AlertsState {
  AlertList: ReactElement;
  showAlert: (data: AlertCreation) => void;
}

const getTimeout = (created: Date, maxAgeMs: number): number => {
  const age = Date.now() - created.getTime();
  const remaining = maxAgeMs - age;
  return remaining > 0 ? remaining : 0;
};

const addAlert = (data: AlertData[], creation: AlertCreation, max: number) => {
  const newAlert: AlertData = {
    content: creation.content,
    created: new Date(),
    variant: creation.variant,
  };

  const updated = [...data, newAlert];

  if (updated.length > max) {
    updated.shift();
  }

  return updated;
};

const mapComponent = (data?: AlertData[] | null): ReactElement => (
  <div className={styles.Container}>
    {data?.map((d, i) => (
      <Alert
        key={i}
        className={styles.Alert}
        variant={d.variant ?? 'dark'}
        style={
          {
            '--opacity': 1,
            '--transform-y': `${i * -120}%`,
          } as React.CSSProperties
        }
      >
        {d.content}
      </Alert>
    ))}
  </div>
);

export const useAlerts = ({
  max = 3,
  duration = 10000,
}: AlertsOptions = {}): AlertsState => {
  const [data, setData] = React.useState<AlertData[]>([]);

  const [state, setState] = React.useState<AlertsState>({
    AlertList: mapComponent(),
    showAlert: (creation: AlertCreation) =>
      setData((d) => {
        const updated = addAlert(d, creation, max);

        return updated;
      }),
  });

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (data?.length > 0) {
      const delay = getTimeout(data[0].created, duration);

      timeout = setTimeout(
        () =>
          setData((d) => {
            d.shift();

            return [...d];
          }),
        delay
      );
    }

    setState({
      AlertList: mapComponent(data),
      showAlert: (creation: AlertCreation) =>
        setData((d) => {
          const updated = addAlert(d, creation, max);

          return updated;
        }),
    });

    return () => Boolean(timeout) && clearTimeout(timeout);
  }, [data]);

  return state;
};
