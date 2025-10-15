import classNames from 'classnames';
import React, { ActionDispatch } from 'react';
import { flattenTree, IconButton } from '../../components';
import * as transitionStyles from '../../components/slide-transition/SlideTransition.module.scss';
import { TreeItems } from '../../components/tree/types';
import { AlertCreation } from '../../hooks';
import { AppStateActionType as ActionType, AppStateAction } from '../app';
import * as styles from './FloatingUi.module.scss';

export enum UiMode {
  Hidden,
  Default,
  Confirm,
}

interface FloatingUiProps {
  headerId: string;
  selectedId: string;
  items: TreeItems;
  containerRef: React.RefObject<HTMLDivElement>;
  dispatch: ActionDispatch<[action: AppStateAction]>;
  showAlert: (creation: AlertCreation) => void;
}

const calcUiMode = (props: FloatingUiProps): UiMode => {
  if (Boolean(props.headerId)) {
    return UiMode.Default;
  }

  return UiMode.Hidden;
};

export const FloatingUi: React.FC<FloatingUiProps> = (props) => {
  const mode = React.useMemo(() => calcUiMode(props), [props.headerId]);

  const handleCreate = () => {
    const insertIndex = getInsertIndex(props.containerRef.current);

    const flattenedItems = flattenTree(props.items);

    const itemId = flattenedItems[insertIndex].id as string;

    if (Boolean(props.headerId)) {
      props.dispatch({
        type: ActionType.InitiateItemCreate,
        headerId: props.headerId,
        itemId,
      });
    } else if (insertIndex !== null) {
      props.dispatch({
        type: ActionType.InitiateHeaderCreate,
        index: insertIndex,
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
  if (!Boolean(view)) return null;

  const centerY = view.scrollTop + view.clientHeight / 2;

  // TODO: this is pretty brittle
  const items = view.querySelectorAll<HTMLLIElement>(
    `.${transitionStyles.current} li`
  );

  for (let i = 0; i < items.length; i++) {
    const el = items[i];
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;

    if (centerY <= bottom || top > centerY) {
      return i;
    }
  }

  return items.length - 1;
}
