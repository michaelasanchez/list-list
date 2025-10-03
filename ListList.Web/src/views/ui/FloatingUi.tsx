import classNames from 'classnames';
import React, { ActionDispatch } from 'react';
import { IconButton } from '../../components';
import { AlertCreation } from '../../hooks';
import { AppStateActionType as ActionType, AppStateAction } from '../app';
import * as styles from './FloatingUi.module.scss';

export enum UiMode {
  Hidden,
  Default,
  Confirm,
}

interface FloatingUiProps {
  selectedHeaderId: string;
  viewRef: React.RefObject<HTMLDivElement>;
  dispatch: ActionDispatch<[action: AppStateAction]>;
  showAlert: (creation: AlertCreation) => void;
}

const calcUiMode = (props: FloatingUiProps): UiMode => {
  if (Boolean(props.selectedHeaderId)) {
    return UiMode.Default;
  }

  return UiMode.Hidden;
};

export const FloatingUi: React.FC<FloatingUiProps> = (props) => {
  const mode = React.useMemo(() => calcUiMode(props), [props.selectedHeaderId]);

  const handleCreate = () => {
    const index = getInsertIndex(props.viewRef.current);

    if (Boolean(props.selectedHeaderId)) {
      props.dispatch({
        type: ActionType.InitiateItemCreate,
        headerId: props.selectedHeaderId,
        index,
      });
    } else {
      props.dispatch({
        type: ActionType.InitiateHeaderCreate,
        index,
      });
    }
  };

  return (
    <div className={styles.FloatingUi}>
      <div className={classNames(styles.Layer, styles.Active)}>
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

function getInsertIndex(view: HTMLElement) {
  const centerY = view.scrollTop + view.clientHeight / 2;

  const items = view.querySelectorAll<HTMLLIElement>('.list-container > li');

  // console.log('VIEW', view.clientHeight, view.scrollTop);
  // console.log('CENTER', centerY);
  // console.log('--------------------------');

  for (let i = 0; i < items.length; i++) {
    const el = items[i];
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;

    // console.log(
    //   top,
    //   bottom,
    //   el.querySelector('.label-editor.label span').textContent
    // );

    if (centerY <= bottom || top > centerY) {
      // console.log(' -> index', i);
      return i;
    }
  }

  // console.log(' -> last', items.length);
  return items.length;
}
