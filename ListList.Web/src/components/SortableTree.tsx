import {
  Announcements,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  MeasuringStrategy,
  Modifier,
  PointerSensor,
  closestCenter,
  defaultDropAnimation,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { CSS } from '@dnd-kit/utilities';
import { ListItem, ListItems } from '../models';
import { ListItemApi } from '../network';
import { Node } from '../shared';
import { AppStateAction, AppStateActionType } from '../views';
import { sortableTreeKeyboardCoordinates } from './keyboardCoordinates';
import type { SensorContext } from './types.ts';
import {
  // buildTree,
  // flattenTree,
  // getChildCount,
  getProjection,
} from './utilities';
import React from 'react';
import { OldSortableTreeItem } from './old-tree/OldSortableTreeItem';

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: 'ease-out',
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

interface SortableTreeProps {
  token: string;
  items: ListItems;
  reloadHeader: (headerId: string) => void;
  dispatchAppAction: (action: AppStateAction) => void;
  collapsible?: boolean;
  indentationWidth?: number;
  indicator?: boolean;
  removable?: boolean;
}

export const SortableTree: React.FC<SortableTreeProps> = ({
  token,
  items,
  reloadHeader,
  dispatchAppAction,
  collapsible,
  indentationWidth = 50,
  indicator = false,
  removable,
}: SortableTreeProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: string | null;
    overId: string;
  } | null>(null);

  const projected =
    activeId && overId
      ? getProjection(items, activeId, overId, offsetLeft, indentationWidth)
      : null;

  const sensorContext: SensorContext = useRef({
    items: items,
    offset: offsetLeft,
  });

  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, indicator, indentationWidth)
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const sortedIds = useMemo(() => items.map(({ id }) => id), [items]);

  const activeItem = activeId ? items.find(({ id }) => id === activeId) : null;

  useEffect(() => {
    sensorContext.current = {
      items: items,
      offset: offsetLeft,
    };
  }, [items, offsetLeft]);

  const announcements: Announcements = {
    onDragStart({ active }) {
      return `Picked up ${active.id}.`;
    },
    onDragMove({ active, over }) {
      return getMovementAnnouncement('onDragMove', active.id.toString(), over?.id.toString());
    },
    onDragOver({ active, over }) {
      return getMovementAnnouncement('onDragOver', active.id.toString(), over?.id.toString());
    },
    onDragEnd({ active, over }) {
      return getMovementAnnouncement('onDragEnd', active.id.toString(), over?.id.toString());
    },
    onDragCancel({ active }) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`;
    },
  };

  return (
    <div className="sortable-tree">
      <DndContext
        accessibility={{ announcements }}
        sensors={sensors}
        collisionDetection={closestCenter}
        measuring={measuring}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={sortedIds}
          strategy={verticalListSortingStrategy}
        >
          {getVisible(items, activeId).map(
            ({
              id,
              headerId,
              label,
              childCount,
              depth,
              descendantCount,
              expanded,
            }) => (
              <OldSortableTreeItem
                key={id}
                id={id}
                value={label}
                childCount={descendantCount}
                collapsed={Boolean(!expanded && childCount)}
                depth={
                  // id === activeId && projected ? projected.depth : depth
                  id === activeId && projected ? projected.depth : depth /*+ 1*/
                }
                indentationWidth={indentationWidth}
                indicator={indicator}
                onCollapse={
                  collapsible && childCount
                    ? () => handleCollapse(headerId, id)
                    : undefined
                }
                onRemove={
                  removable ? () => handleRemove(headerId, id) : undefined
                }
              />
            )
          )}
          {createPortal(
            <DragOverlay
              className="sortable-tree-overlay"
              dropAnimation={dropAnimationConfig}
              modifiers={indicator ? [adjustTranslate] : undefined}
            >
              {activeId && activeItem ? (
                <OldSortableTreeItem
                  id={activeId}
                  depth={activeItem.depth}
                  clone
                  childCount={activeItem.descendantCount}
                  value={activeItem.label}
                  indentationWidth={indentationWidth}
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </SortableContext>
      </DndContext>
    </div>
  );

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId.toString());
    setOverId(activeId.toString());

    const activeItem = items.find(({ id }) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId.toString(),
      });
    }

    document.body.style.setProperty('cursor', 'grabbing');
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id.toString() ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;

    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;

      const active = items.find((i) => i.id == e.active.id);
      const parent = items.find((i) => i.id == parentId);
      const over = items.find((i) => i.id == e.over.id);

      const children = Node.getDirectChildren(items, parent);
      const newIndex = Node.isDirectChild(parent, over)
        ? children.findIndex((i) => i.id == over.id)
        : children.length;

        console.clear();
        console.log(parent.label, newIndex)

      new ListItemApi(token)
        .Relocate(active.id, parent.id, newIndex)
        .then(() => reloadHeader(active.headerId));
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty('cursor', '');
  }

  function handleRemove(headerId: string, itemId: string) {
    // TODO: reducer action
    // setItems((items) => removeItem(items, id));
  }

  function handleCollapse(headerId: string, itemId: string) {
    dispatchAppAction({
      type: AppStateActionType.ToggleExpanded,
      headerId,
      itemId,
    });
  }

  function getMovementAnnouncement(
    eventName: string,
    activeId: string,
    overId?: string
  ) {
    if (overId && projected) {
      if (eventName !== 'onDragEnd') {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          });
        }
      }

      const clonedItems: ListItem[] = JSON.parse(JSON.stringify(items));
      const overIndex = clonedItems.findIndex(({ id }) => id === overId);
      const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const previousItem = sortedItems[overIndex - 1];

      let announcement;
      const movedVerb = eventName === 'onDragEnd' ? 'dropped' : 'moved';
      const nestedVerb = eventName === 'onDragEnd' ? 'dropped' : 'nested';

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
        } else {
          let previousSibling: ListItem | undefined = previousItem;
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId: string | null = previousSibling.parentId;
            previousSibling = sortedItems.find(({ id }) => id === parentId);
          }

          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
          }
        }
      }

      return announcement;
    }

    return;
  }

  function getVisible(items: ListItems, activeId?: string): ListItems {
    if (!items?.length) return [];

    const visible: ListItems = [];
    let skipUntilLeftIsAtLeast: number | null = null;

    for (let i = 0; i < items.length; i++) {
      // for (let i = 1; i < items.length; i++) {
      const node = items[i];

      if (
        skipUntilLeftIsAtLeast !== null &&
        node.left < skipUntilLeftIsAtLeast
      ) {
        continue; // inside a collapsed subtree
      }

      // visible.push({ ...node, depth: node.depth });
      visible.push({ ...node, depth: node.depth /*- 1*/ });

      const isCollapsedParent = node.hasChildren && !node.expanded;
      const isActiveExpanded = node.id == activeId && node.expanded;

      if (isCollapsedParent || isActiveExpanded) {
        skipUntilLeftIsAtLeast = node.right + 1;
      } else {
        skipUntilLeftIsAtLeast = null;
      }
    }

    return visible;
  }
};

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
