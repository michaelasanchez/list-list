import React from 'react';
import { Alert, Modal } from 'react-bootstrap';
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

const strings = {
  create: 'Create',
  empty: 'No share links have been created.',
  title: 'Share Links',
};

const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);

  copy.setDate(copy.getDate() + days);

  return copy;
};

export const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const today = formatDate(new Date());

export const ShareModal: React.FC<ShareModalProps> = (props) => {
  const [pending, setPending] = React.useState<MinimumLink | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Clear out pending when modal is closed
  React.useEffect(() => {
    if (Boolean(pending)) {
      setPending(null);
    }
  }, [props.show]);

  const checkError = () => error !== null && setError(null);

  const handleCancel = () => {
    setPending(null);
    setError(null);
  };

  const handleShare = () => {
    checkError();

    props
      .onShare(pending)
      .then(() => setPending(null))
      .catch((e) => setError(e.message));
  };

  const handlePut = () => {
    checkError();

    if (Boolean(pending.id)) {
      const { id, ...put } = pending;

      props
        .onUpdate(id, put)
        .then(() => setPending(null))
        .catch((e) => setError(e.message));
    }
  };

  return (
    <Modal className={styles.Modal} show={props.show} onHide={props.onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{strings.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={classNames(styles.Heading)}></div>
        <div className={classNames(styles.Inset)}>
          {!Boolean(props.shareLinks?.length) && !Boolean(pending) && (
            <div className={styles.Empty}>{strings.empty}</div>
          )}
          {props.shareLinks?.map((l, i) => {
            const editing = pending?.id == l.id;

            return (
              <ShareLink
                key={i}
                link={editing ? pending : l}
                editing={editing}
                onCancel={handleCancel}
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
          {Boolean(pending) && !Boolean(pending.id) && (
            <ShareLink
              link={pending}
              editing={true}
              errored={Boolean(error)}
              onCancel={handleCancel}
              onConfirm={handleShare}
              onUpdate={(update) => setPending((s) => ({ ...s, ...update }))}
            />
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className={styles.Footer}>
        {!Boolean(error) ? (
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
            {strings.create}
          </IconButton>
        ) : (
          <Alert autoFocus={true} className={styles.Alert} variant="danger">
            {error}
          </Alert>
        )}
      </Modal.Footer>
    </Modal>
  );
};
