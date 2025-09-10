import classNames from 'classnames';
import React, { ActionDispatch } from 'react';
import { Alert } from 'react-bootstrap';
import { IconButton } from '../../components';
import { AlertCreation } from '../../hooks';
import { Header } from '../../models';
import { AppStateActionType as ActionType, AppStateAction } from '../app';
import * as styles from './FloatingUi.module.scss';

export enum UiMode {
  Hidden,
  Default,
  Confirm,
}

interface FloatingUiProps {
  selectedHeader: Header;
  dispatch: ActionDispatch<[action: AppStateAction]>;
  showAlert: (creation: AlertCreation) => void;
}

const calcUiMode = (props: FloatingUiProps): UiMode => {
  if (props.selectedHeader) {
    return UiMode.Default;
  }

  return UiMode.Hidden;
};

export const FloatingUi: React.FC<FloatingUiProps> = (props) => {
  const mode = React.useMemo(() => calcUiMode(props), [props.selectedHeader]);

  const handleCreate = () => {
    if (props.selectedHeader) {
      props.dispatch({
        type: ActionType.InitiateItemCreate,
        headerId: props.selectedHeader.id,
      });
    } else {
      props.dispatch({
        type: ActionType.InitiateHeaderCreate,
      });
    }
  };

  return (
    <div className={styles.FloatingUi}>
      <div className={classNames(styles.Layer, styles.Active)}>
        {/* <IconButton
          iconType="question"
          size="sm"
          variant="info"
          onClick={() =>
            props.showAlert({
              content: (
                <>
                  <strong>[List Name]</strong> was deleted.{' '}
                  <Alert.Link>Undo</Alert.Link>
                </>
              ),
            })
          }
        /> */}
        <IconButton
          iconType="create"
          size="lg"
          variant="success"
          onClick={handleCreate}
        />
      </div>
      <div
        className={classNames(
          styles.Layer,
          mode == UiMode.Confirm && styles.Active
        )}
      >
        <IconButton iconType="cancel" variant="danger" />
        <IconButton iconType="confirm" variant="success" size="lg" />
      </div>
    </div>
  );
};
