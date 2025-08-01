import React from 'react';
import { Badge, Card, Modal } from 'react-bootstrap';
import { ShareLink } from '../../models';

import classNames from 'classnames';
import { ButtonVariant } from 'react-bootstrap/esm/types';
import { IconButton, LabelEditor } from '..';
import { SharedPermission } from '../../contracts';
import * as styles from './ShareModal.module.scss';

export interface ShareModalProps {
  show: boolean;
  shareLinks: ShareLink[];
  onClose: () => void;
  // onShare: (url: string) => void;
}

const getPermissionLabel = (p: SharedPermission): string => {
  switch (p) {
    case SharedPermission.View:
      return 'View';
    case SharedPermission.Edit:
      return 'Edit';
  }
};

const getPermissionVariant = (p: SharedPermission): ButtonVariant => {
  switch (p) {
    case SharedPermission.View:
      return 'info';
    case SharedPermission.Edit:
      return 'warning';
  }
};

export const ShareModal: React.FC<ShareModalProps> = (props) => {
  return (
    <Modal show={props.show} onHide={props.onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Share</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={classNames(styles.Heading)}>
          <h6>Links</h6>
          <IconButton iconType="create" variant="outline-secondary" size="sm">
            Create
          </IconButton>
        </div>
        <div className={classNames(styles.Inset)}>
          {props.shareLinks?.map((l, i) => (
            <Card key={i} className={classNames(styles.ShareLink)}>
              <Card.Body>
                <div className={classNames(styles.Content)}>
                  
                  <code>/<LabelEditor name={i.toString()} label={l.token} /></code>
                  <Badge bg={getPermissionVariant(l.permission)}>
                    {getPermissionLabel(l.permission)}
                  </Badge>
                </div>
                <div className={classNames(styles.Actions)}>
                  <IconButton
                    // size="sm"
                    variant="outline-secondary"
                    iconType="link"
                    onClick={() => navigator.share({ url: l.token })}
                  />
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
{/* 
        <div className={classNames(styles.Heading)}>
          <h6>Users</h6>
          <IconButton iconType="create" variant="outline-secondary" size="sm">
            Invite
          </IconButton>
        </div>
        <div className={classNames(styles.Inset, styles.Users)}></div> */}
      </Modal.Body>
      {/* <Modal.Footer>
        <Button variant="secondary" onClick={props.onCancel}>
          Close
        </Button>
        <Button variant="primary" onClick={props.onConfirm}>
          Share
        </Button>
      </Modal.Footer> */}
    </Modal>
  );
};
