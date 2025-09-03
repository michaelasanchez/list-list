import classNames from 'classnames';
import React from 'react';
import {
  Card,
  Dropdown,
  DropdownButton,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';
import { formatDate, today } from '.';
import { ApiHeaderShare, SharedPermission } from '../../contracts';
import { IconButton } from '../button';
import * as styles from './ShareModal.module.scss';

export interface MinimumLink extends ApiHeaderShare {
  id?: string;
}

export interface ShareLinkProps {
  link: MinimumLink;
  editing?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  onDelete?: () => void;
  onUpdate?: (update: Partial<MinimumLink>) => void;
}

const showLabels = false;

export const ShareLink: React.FC<ShareLinkProps> = (props) => {
  const { link, editing, onCancel, onConfirm, onDelete, onUpdate } = props;

  const isFutureOrToday = !link?.expiresOn || link?.expiresOn >= today;

  return (
    <Card className={classNames(styles.ShareLink, editing && styles.editing)}>
      <Card.Body>
        <div className={styles.Content}>
          <Form.Group className={classNames(styles.formgroup, styles.url)}>
            {showLabels && <Form.Label as="small">Url</Form.Label>}

            <InputGroup size="sm">
              <InputGroup.Text className={styles.disabled}>/</InputGroup.Text>
              <Form.Control
                className="code"
                autoFocus={editing}
                min={today}
                value={link.token}
                onChange={(e) =>
                  onUpdate?.({ id: link.id, token: e.target.value })
                }
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className={styles.formgroup}>
            {showLabels && <Form.Label as="small">Expiration</Form.Label>}
            <Form.Control
              className={classNames(
                link.expiresOn === null && styles.dateEmpty
              )}
              size="sm"
              type="date"
              // isInvalid={!isFutureOrToday}
              value={
                Boolean(link.expiresOn)
                  ? formatDate(new Date(link.expiresOn))
                  : ''
              }
              onChange={(e) =>
                onUpdate?.({ id: link.id, expiresOn: e.target.value })
              }
            />
            <Form.Control.Feedback type="invalid">
              Please select today or a future date.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className={styles.formgroup}>
            {showLabels && <Form.Label as="small">Permission</Form.Label>}
            <DropdownButton
              title={getPermissionLabel(link.permission)}
              size="sm"
              variant="outline-secondary"
              // variant={getPermissionVariant(link.permission)}
            >
              {[SharedPermission.View, SharedPermission.Edit].map((p, i) => (
                <Dropdown.Item
                  key={i}
                  active={link.permission == p}
                  // className={getPermissionVariant(p, false)}
                  onClick={() =>
                    props.onUpdate?.({ id: link.id, permission: p })
                  }
                >
                  {getPermissionLabel(p)}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </Form.Group>
        </div>
        <div className={styles.Actions}>
          <div className={classNames(styles.Layer, editing && styles.Active)}>
            <IconButton
              iconType="cancel"
              size="sm"
              variant="outline-danger"
              onClick={onCancel}
            />
            <IconButton
              iconType="confirm"
              size="sm"
              variant="outline-success"
              onClick={onConfirm}
            />
          </div>
          <div className={classNames(styles.Layer, !editing && styles.Active)}>
            <IconButton
              iconType="delete"
              size="sm"
              variant="outline-danger"
              onClick={onDelete}
            />
            <IconButton
              iconType="link"
              size="sm"
              variant="success"
              onClick={() => navigator.share({ url: link.token })}
            />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const getPermissionLabel = (p: SharedPermission): string => {
  switch (p) {
    case SharedPermission.View:
      return 'View';
    case SharedPermission.Edit:
      return 'Edit';
  }
};

const getPermissionVariant = (
  p: SharedPermission,
  outline: boolean = true
): ButtonVariant => {
  switch (p) {
    case SharedPermission.View:
      return outline ? 'outline-info' : 'info';
    case SharedPermission.Edit:
      return outline ? 'outline-warning' : 'warning';
    default:
      return outline ? 'outline-secondary' : 'secondary';
  }
};
