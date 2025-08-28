import classNames from 'classnames';
import React from 'react';
import {
  Badge,
  Card,
  Dropdown,
  DropdownButton,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';
import { SharedPermission } from '../../contracts';
import { ShareLink as Link } from '../../models';
import { IconButton } from '../button';
import * as styles from './ShareModal.module.scss';

export interface ShareLinkProps {
  link: Link;
  pending?: boolean;
  onUpdate?: (update: {
    token?: string;
    permission?: SharedPermission;
  }) => void;
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

export const ShareLink: React.FC<ShareLinkProps> = (props) => {
  const { link, pending, onUpdate } = props;

  return (
    <Card className={classNames(styles.ShareLink, pending && styles.pending)}>
      <Card.Body>
        <div className={styles.Content}>
          <Form.Group className={classNames(styles.formgroup, styles.url)}>
            <Form.Label>Url</Form.Label>

            <InputGroup>
              <InputGroup.Text>/</InputGroup.Text>
              <Form.Control
                className="code"
                value={link.token}
                onChange={(e) => onUpdate({ token: e.target.value })}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className={styles.formgroup}>
            <Form.Label>Permission</Form.Label>
            {pending ? (
              <DropdownButton
                title={getPermissionLabel(link.permission)}
                variant="outline-secondary"
              >
                {[SharedPermission.View, SharedPermission.Edit].map((p, i) => (
                  <Dropdown.Item
                    key={i}
                    active={link.permission == p}
                    onClick={() => props.onUpdate({ permission: p })}
                  >
                    {getPermissionLabel(p)}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            ) : (
              <Badge bg={getPermissionVariant(link.permission)}>
                {getPermissionLabel(link.permission)}
              </Badge>
            )}
          </Form.Group>
        </div>
        <div className={styles.Actions}>
          {!pending ? (
            <IconButton
              variant="outline-secondary"
              iconType="link"
              onClick={() => navigator.share({ url: link.token })}
            />
          ) : (
            <>
              <IconButton
                variant="outline-success"
                iconType="confirm"
              />
              <IconButton
                variant="outline-danger"
                iconType="cancel"
              />
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};
