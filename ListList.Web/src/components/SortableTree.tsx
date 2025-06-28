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
import { SortableTreeItem } from './tree';
import type { SensorContext } from './types.ts';
import {
  // buildTree,
  // flattenTree,
  // getChildCount,
  getProjection,
} from './utilities';
import React = require('react');

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
  // const [items, setItems] = useState(() => defaultItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: string | null;
    overId: string;
  } | null>(null);

  // const items = useMemo(() => {
  //   const flattenedTree = flattenTree(items);
  //   const collapsedItems = flattenedTree.reduce<string[]>(
  //     (acc, { children, expanded, id }) =>
  //       !expanded && children.length ? [...acc, `${id}`] : acc,
  //     []
  //   );

  //   return removeChildrenOf(
  //     flattenedTree,
  //     activeId != null ? [activeId, ...collapsedItems] : collapsedItems
  //   );
  // }, [activeId, items]);

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
      return getMovementAnnouncement('onDragMove', active.id, over?.id);
    },
    onDragOver({ active, over }) {
      return getMovementAnnouncement('onDragOver', active.id, over?.id);
    },
    onDragEnd({ active, over }) {
      return getMovementAnnouncement('onDragEnd', active.id, over?.id);
    },
    onDragCancel({ active }) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`;
    },
  };

  // console.log(items, getVisible(items));

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
          {getVisible(items).map(
            ({
              id,
              headerId,
              label,
              childCount,
              depth,
              descendantCount,
              expanded,
            }) => (
              <SortableTreeItem
                key={id}
                id={id}
                value={label}
                childCount={descendantCount}
                collapsed={Boolean(!expanded && childCount)}
                depth={id === activeId && projected ? projected.depth : depth}
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
                <SortableTreeItem
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
    setActiveId(activeId);
    setOverId(activeId);

    const activeItem = items.find(({ id }) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      });
    }

    document.body.style.setProperty('cursor', 'grabbing');
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;

    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;

      const active = items.find((i) => i.id == e.active.id);
      const parent = items.find((i) => i.id == projected.parentId);
      const over = items.find((i) => i.id == e.over.id);

      const children = Node.getDirectChildren(items, parent);
      const newIndex = Node.isDirectChild(parent, over)
        ? children.findIndex((i) => i.id == over.id)
        : children.length;

      // console.log(`moving ${active.label}`);
      // console.log(
      //   `to be a child of ${parent.label}, between ${
      //     children[newIndex - 1]?.label ?? 'start'
      //   } & ${children[newIndex]?.label ?? 'end'}`
      // );
      // console.log('------------------------------------');

      new ListItemApi(token)
        .Relocate(active.id, parent.id, newIndex)
        .then((result) => {
          console.log('OPERATION RESULT', result);

          reloadHeader(active.headerId);
        });
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

  function getVisible(items: ListItems): ListItems {
    if (!items?.length) return [];

    const visible: ListItems = [];
    let skipUntilLeftIsAtLeast: number | null = null;

    for (let i = 1; i < items.length; i++) {
      const node = items[i];

      if (
        skipUntilLeftIsAtLeast !== null &&
        node.left < skipUntilLeftIsAtLeast
      ) {
        continue; // inside a collapsed subtree
      }

      visible.push({ ...node, depth: node.depth - 1 });

      if (node.hasChildren && !node.expanded) {
        skipUntilLeftIsAtLeast = node.right + 1;
      } else {
        skipUntilLeftIsAtLeast = null;
      }
    }

    return visible;
  }

  // function buildTree(data: ListItems) {
  //   return data.map((node, i) => ({
  //     ...node,
  //     id: i, // assuming no ID, we use index
  //     children: data
  //       .filter(
  //         (child) =>
  //           child.left > node.left &&
  //           child.right < node.right &&
  //           data.every(
  //             (other) =>
  //               !(
  //                 other.left > node.left &&
  //                 other.right < node.right &&
  //                 child.left > other.left &&
  //                 child.right < other.right
  //               )
  //           )
  //       )
  //       .map((child) => data.indexOf(child)),
  //   }));
  // }

  // function getVisibleNodes(data: ListItems, expandedNodeIds: string[]) {
  //   const tree = buildTree(data);

  //   const visible = new Set();

  //   function dfs(nodeIndex: number, parentVisible: boolean) {
  //     if (!parentVisible) return;

  //     const node = tree[nodeIndex];
  //     visible.add(nodeIndex);

  //     const isExpanded = expandedNodeIds.includes(nodeIndex);
  //     if (isExpanded) {
  //       for (const childIndex of node.children) {
  //         dfs(childIndex, true);
  //       }
  //     }
  //   }

  //   dfs(0, true); // start with root node visible

  //   return data.filter((_, i) => visible.has(i));
  // }
};

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
