import React, { ReactElement } from 'react';
import { Alert } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';
import * as styles from './useAlerts.module.scss';

export interface AlertCreation {
  content: ReactElement;
  variant?: Variant | null;
}

export interface AlertData extends AlertCreation {
  id: string;
  created: Date;
}

export interface AlertsOptions {
  max?: number;
  duration?: number;
}

export interface AlertsState {
  AlertList: ReactElement;
  hideAlert: (id: string) => void;
  showAlert: (data: AlertCreation) => string;
}

const getUniqueId = (): string => 'id' + Math.random().toString(16).slice(2);

const getTimeout = (created: Date, maxAgeMs: number): number => {
  const age = Date.now() - created.getTime();
  const remaining = maxAgeMs - age;
  return remaining > 0 ? remaining : 0;
};

const mapAlert = (creation: AlertCreation) => ({
  id: getUniqueId(),
  content: creation.content,
  created: new Date(),
  variant: creation.variant,
});

const mapAlertList = (
  data?: AlertData[] | null,
  hideAlert?: () => void
): ReactElement => (
  <div className={styles.Container}>
    {data?.map((d, i) => (
      <Alert
        key={i}
        className={styles.Alert}
        dismissible
        onClose={() => hideAlert?.()}
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

const updateAlerts = (data: AlertData[], newAlert: AlertData, max: number) => {
  const updated = [...data, newAlert];

  if (updated.length > max) {
    updated.shift();
  }

  return updated;
};

export const useAlerts = ({
  max = 3,
  duration = 15000,
}: AlertsOptions = {}): AlertsState => {
  const [alerts, setAlerts] = React.useState<AlertData[]>([]);

  const [state, setState] = React.useState<AlertsState>({
    AlertList: mapAlertList(),
    hideAlert: () => {},
    showAlert: (creation: AlertCreation) => {
      const data = mapAlert(creation);

      setAlerts((d) => {
        const updated = updateAlerts(d, data, max);

        return updated;
      });

      return data.id;
    },
  });

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    // Set first fade timeout
    if (alerts?.length > 0) {
      const delay = getTimeout(alerts[0].created, duration);

      timeout = setTimeout(
        () =>
          setAlerts((d) => {
            d.shift();

            return [...d];
          }),
        delay
      );
    }

    // Set hook output
    setState({
      AlertList: mapAlertList(alerts),
      hideAlert: (id: string) => setAlerts((d) => d.filter((i) => i.id != id)),
      showAlert: (creation: AlertCreation) => {
        const newAlert = mapAlert(creation);

        setAlerts((d) => updateAlerts(d, newAlert, max));

        return newAlert.id;
      },
    });

    return () => Boolean(timeout) && clearTimeout(timeout);
  }, [alerts]);

  return state;
};
