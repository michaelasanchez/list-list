import React from 'react';
import { Modal } from 'react-bootstrap';
import { ShareLink as Link } from '../../models';

import classNames from 'classnames';
import { IconButton, MinimumLink, ShareLink } from '..';
import { ApiHeaderShare, SharedPermission } from '../../contracts';
import { Succeeded } from '../../network';
import * as styles from './ShareModal.module.scss';

export interface ShareModalProps {
  show: boolean;
  shareLinks: Link[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, put: MinimumLink) => Promise<Succeeded>;
  onShare: (share: ApiHeaderShare) => Promise<Succeeded>;
}

const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);

  copy.setDate(copy.getDate() + days);

  return copy;
};

export const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const today = formatDate(new Date());

export const ShareModal: React.FC<ShareModalProps> = (props) => {
  const [pending, setPending] = React.useState<MinimumLink | null>(null);

  // Clear out pending when modal is closed
  React.useEffect(() => {
    if (Boolean(pending)) {
      setPending(null);
    }
  }, [props.show]);

  const handleShare = () => {
    props.onShare(pending).then(() => setPending(null));
  };

  const handlePut = () => {
    if (Boolean(pending.id)) {
      const { id, ...put } = pending;

      props.onUpdate(id, put).then(() => setPending(null));
    }
  };

  return (
    <Modal show={props.show} onHide={props.onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Share Links</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={classNames(styles.Heading)}>
          <IconButton
            iconType="create"
            variant="outline-secondary"
            size="sm"
            onClick={() =>
              setPending(() => ({
                token: 'new-link',
                permission: SharedPermission.View,
                expiresOn: formatDate(addDays(new Date(), 7)),
              }))
            }
          >
            Create
          </IconButton>
        </div>
        <div className={classNames(styles.Inset)}>
          {props.shareLinks?.map((l, i) => {
            const editing = pending?.id == l.id;

            return (
              <ShareLink
                key={i}
                link={editing ? pending : l}
                editing={editing}
                onCancel={() => setPending(null)}
                onConfirm={handlePut}
                onDelete={() => props.onDelete(l.id)}
                onUpdate={(update) => {
                  setPending((pending) => {
                    const prev = Boolean(pending)
                      ? pending
                      : props.shareLinks?.find((l) => l.id == update.id);

                    return { ...prev, ...update };
                  });
                }}
              />
            );
          })}
          {Boolean(pending) && Boolean(!pending.id) && (
            <ShareLink
              link={pending}
              editing={true}
              onCancel={() => setPending(null)}
              onConfirm={handleShare}
              onUpdate={(update) => setPending((s) => ({ ...s, ...update }))}
            />
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};
