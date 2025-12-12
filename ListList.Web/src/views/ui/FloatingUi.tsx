import classNames from 'classnames';
import React, { ActionDispatch } from 'react';
import { flattenTree, IconButton, removeChildrenOf } from '../../components';
import { TreeItems } from '../../components/tree/types';
import { AlertCreation } from '../../hooks';
import { AppStateActionType as ActionType, AppStateAction } from '../app';
import * as appStyles from '../app/App.module.scss';
import * as styles from './FloatingUi.module.scss';

export enum UiMode {
  Hidden,
  Default,
  Confirm,
}

interface FloatingUiProps {
  headerId: string;
  selectedId: string;
  readonly: boolean;
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
    console.log('FloatingUi: handleCreate');
    const insertIndex = getInsertIndex(props.containerRef.current);

    if (Boolean(props.headerId)) {
      // TODO: this one is a toughy. it's all computed state
      //  hate to do all this twice, but at least it's only on click
      const flattenedItems = flattenTree(props.items);

      const collapsedItemIds = flattenedItems
        .filter((i) => i.collapsed)
        .map((i) => i.id);

      const remaining = removeChildrenOf(flattenedItems, collapsedItemIds);

      const itemId =
        insertIndex < remaining.length
          ? (remaining[insertIndex]?.id as string)
          : null;

      props.dispatch({
        type: ActionType.InitiateItemCreate,
        headerId: props.headerId,
        itemId: itemId ?? props.selectedId,
        asChild: !Boolean(itemId),
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
      <div className={classNames(styles.Layer, !props.readonly && styles.Active)}>
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
  if (!view) return null;

  const items = view.querySelectorAll<HTMLLIElement>(
    `.${appStyles.ViewContainer} li`
  );

  const centerY = window.innerHeight / 2;

  for (let i = 0; i < items.length; i++) {
    const elRect = items[i].getBoundingClientRect();
    const bottom = elRect.bottom;

    if (centerY <= bottom) {
      return i;
    }
  }

  return items.length;
}

function drawDebugLines(view: HTMLElement) {
  if (!view) return;

  const rect = view.getBoundingClientRect();

  // addLine(rect, rect.top, 'red');
  // addLine(rect, rect.top + rect.height / 2, 'red');

  // addLine(rect, 1);
  addLine(rect, window.innerHeight / 2);
  // addLine(rect, rect.top + rect.height - 1);

  // Optional: auto-remove after 3 seconds
  // setTimeout(() => line.remove(), 3000);
}

function addLine(rect: DOMRect, top: number, color: string = 'green') {
  const line = document.createElement('div');

  Object.assign(line.style, {
    position: 'absolute',
    left: `${rect.left + window.scrollX}px`,
    top: `${top}px`,
    width: `${rect.width}px`,
    height: '1px',
    background: color,
    opacity: 0.5,
    zIndex: '9999',
    pointerEvents: 'none',
  });

  document.body.appendChild(line);
}
