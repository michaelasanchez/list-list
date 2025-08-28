import React from 'react';
import { Modal } from 'react-bootstrap';
import { ShareLink as Link } from '../../models';

import classNames from 'classnames';
import { IconButton, ShareLink } from '..';
import { SharedPermission } from '../../contracts';
import * as styles from './ShareModal.module.scss';

export interface ShareModalProps {
  show: boolean;
  shareLinks: Link[];
  onClose: () => void;
  onShare: (url: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = (props) => {
  const [pending, setPending] = React.useState<Link | null>(null);

  return (
    <Modal show={props.show} onHide={props.onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Share</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={classNames(styles.Heading)}>
          <h6>Links</h6>
          <IconButton
            iconType="create"
            variant="outline-secondary"
            size="sm"
            onClick={() =>
              setPending({
                id: 'pending',
                token: 'new-link',
                permission: SharedPermission.View,
                isActive: true,
              })
            }
          >
            Create
          </IconButton>
        </div>
        <div className={classNames(styles.Inset)}>
          {props.shareLinks.map((l, i) => (
            <ShareLink key={i} link={l} />
          ))}
          {Boolean(pending) && (
            <ShareLink
              link={pending}
              pending={true}
              onUpdate={(update) => setPending((s) => ({ ...s, ...update }))}
            />
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};
