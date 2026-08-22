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
import { Actions, CustomAction } from '..';
import { Guid } from '../../contracts';
import { Succeeded } from '../../network';
import { newNodeId } from '../../views';
import { SortableTreeItem } from './components';
import { sortableTreeKeyboardCoordinates } from './keyboardCoordinates';
import type {
  FlattenedItem,
  SensorContext,
  TreeItem,
  TreeItems,
} from './types';
import {
  buildTree,
  flattenTree,
  getChildCount,
  getProjection,
  removeChildrenOf,
  removeItem,
  setProperty,
} from './utilities';

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

export interface ActionsProps {
  id: string;
  checklist: boolean;
}

export interface ItemUpdate {
  label?: string;
  description?: string;
}

export interface SortableTreeActions {
  custom?: (props: ActionsProps) => CustomAction[][];
  onCheck?: (nodeId: Guid) => Promise<Succeeded>;
  onClick?: (id: Guid) => void;
  onCollapse?: (partitionId: Guid, nodeId: Guid) => void;
  onCreate?: (
    label: string | null,
    description: string | null,
    overId: Guid | null,
    parentId?: Guid | null,
  ) => Promise<Succeeded>;
  onDelete?: (
    id: Guid,
    overId: Guid,
    parentId: Guid | null,
  ) => Promise<Succeeded>;
  onDragEnd?: (id: Guid, overId: Guid, parentId: Guid) => Promise<Succeeded>;
  onNavigate?: (partitionId: Guid, nodeId: Guid) => void;
  onUpdate?: (id: Guid, update: ItemUpdate) => Promise<Succeeded>;
}

export interface Props {
  checklist?: boolean;
  collapsible?: boolean;
  defaultItems: TreeItems | null;
  indentationWidth?: number;
  indicator?: boolean;
  maxDepth?: number | null;
  readonly?: boolean;
  removable?: boolean;
  actions?: SortableTreeActions;
}

export function SortableTree({
  checklist,
  collapsible,
  defaultItems,
  indicator = false,
  indentationWidth = 50,
  maxDepth = null,
  removable,
  actions,
}: Props) {
  const [items, setItems] = useState(() => defaultItems);
  const [activeId, setActiveId] = useState<Guid | null>(null);
  const [overId, setOverId] = useState<Guid | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: Guid | null;
    overId: Guid;
  } | null>(null);

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<Guid[]>(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      [],
    );

    return removeChildrenOf(
      flattenedTree,
      activeId != null ? [activeId, ...collapsedItems] : collapsedItems,
    );
  }, [activeId, items]);

  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth,
        )
      : null;

  const sensorContext = useRef<SensorContext>({
    items: flattenedItems,
    offset: offsetLeft,
  });

  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, indicator, indentationWidth),
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    }),
  );

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems],
  );

  useEffect(() => {
    setItems(defaultItems);
  }, [defaultItems]);

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const announcements: Announcements = {
    onDragStart({ active }) {
      return `Picked up ${active.id}.`;
    },
    onDragMove({ active, over }) {
      return getMovementAnnouncement(
        'onDragMove',
        active.id as string,
        over?.id as string,
      );
    },
    onDragOver({ active, over }) {
      return getMovementAnnouncement(
        'onDragOver',
        active.id as string,
        over?.id as string,
      );
    },
    onDragEnd({ active, over }) {
      return getMovementAnnouncement(
        'onDragEnd',
        active.id as string,
        over?.id as string,
      );
    },
    onDragCancel({ active }) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`;
    },
  };

  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

  return (
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
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        {flattenedItems.map((item) => {
          const { id, children, collapsed, depth, pending, data } = item;

          const itemActions: Actions = pending
            ? {
                onUpdate: (update: ItemUpdate) => {
                  const overId =
                    flattenedItems[
                      Math.min(
                        flattenedItems.findIndex((i) => i.id == id) + 1,
                        flattenedItems.length - 1,
                      )
                    ].id;

                  const res = actions?.onCreate?.(
                    update.label ?? '',
                    update.description ?? '',
                    overId == newNodeId ? null : overId,
                    item.parentId,
                  );

                  return Promise.resolve(res ?? true);
                },
              }
            : {
                dropdown: actions?.custom?.({
                  id: item.id as string,
                  checklist: data.isChecklist ?? false,
                }),
                onUpdate: (update: ItemUpdate) => {
                  const res = actions?.onUpdate?.(id, update);

                  return Promise.resolve(res ?? true);
                },
              };

          return (
            <SortableTreeItem
              key={id}
              id={id}
              name={`${id}`}
              checkbox={checklist}
              childCount={children.length}
              collapsed={Boolean(collapsed && children.length)}
              data={data}
              depth={id === activeId && projected ? projected.depth : depth}
              indentationWidth={indentationWidth}
              indicator={indicator}
              hooks={itemActions}
              pending={pending}
              onCheck={() => actions?.onCheck?.(id)}
              onClick={() =>
                actions?.onClick
                  ? actions.onClick(id)
                  : collapsible && handleCollapse(item)
              }
              onCollapse={
                collapsible && children.length
                  ? () => handleCollapse(item)
                  : undefined
              }
              onRemove={
                removable || pending ? () => handleRemove(id) : undefined
              }
              onNavigate={
                actions?.onNavigate
                  ? () => actions.onNavigate!(data.partitionId, id)
                  : undefined
              }
            />
          );
        })}
        {createPortal(
          <DragOverlay
            dropAnimation={dropAnimationConfig}
            modifiers={indicator ? [adjustTranslate] : undefined}
          >
            {activeId && activeItem ? (
              <SortableTreeItem
                id={activeId}
                depth={activeItem.depth}
                clone
                childCount={items ? getChildCount(items, activeId) + 1 : 0}
                name={`active-${activeId}`}
                data={activeItem.data}
                indentationWidth={indentationWidth}
              />
            ) : null}
          </DragOverlay>,
          document.body,
        )}
      </SortableContext>
    </DndContext>
  );

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId as string);
    setOverId(activeId as string);

    const activeItem = flattenedItems.find(({ id }) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId as string,
      });
    }

    document.body.style.setProperty('cursor', 'grabbing');
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId((over?.id as string) ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;

      dragEndLocal(active.id as string, over.id as string, depth, parentId!);

      actions?.onDragEnd?.(active.id as string, over.id as string, parentId!);
    }
  }

  function dragEndLocal(
    activeId: Guid,
    overId: Guid,
    depth: number,
    parentId: Guid,
  ) {
    const clonedItems: FlattenedItem[] = JSON.parse(
      JSON.stringify(flattenTree(items)),
    );

    const overIndex = clonedItems.findIndex(({ id }) => id === overId);
    const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
    const activeTreeItem = clonedItems[activeIndex];

    clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

    const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
    const newItems = buildTree(sortedItems);

    setItems(newItems);
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

  async function handleRemove(id: Guid) {
    const index = flattenedItems.findIndex((i) => i.id == id);

    if (actions?.onDelete) {
      await actions.onDelete?.(
        id,
        flattenedItems[index + 1]?.id,
        flattenedItems[index].parentId,
      );
    } else {
      setItems((items) => removeItem(items!, id));
    }
  }

  function handleCollapse(item: TreeItem) {
    actions?.onCollapse?.(item.data.partitionId, item.id);

    setItems((items) =>
      setProperty(items!, item.id, 'collapsed', (value) => {
        return !value;
      }),
    );
  }

  function getMovementAnnouncement(
    eventName: string,
    activeId: Guid,
    overId?: Guid,
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

      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items)),
      );
      const overIndex = clonedItems.findIndex(({ id }) => id === overId);
      const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const previousItem = sortedItems[overIndex - 1];

      let announcement: string | undefined;
      const movedVerb = eventName === 'onDragEnd' ? 'dropped' : 'moved';
      const nestedVerb = eventName === 'onDragEnd' ? 'dropped' : 'nested';

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem?.id}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
        } else {
          let previousSibling: FlattenedItem | undefined = previousItem;
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId: Guid | null = previousSibling.parentId;
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
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
