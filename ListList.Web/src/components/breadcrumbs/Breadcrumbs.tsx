import { UniqueIdentifier } from '@dnd-kit/core';
import cn from 'classnames';
import React from 'react';
import { Button } from 'react-bootstrap';
import * as styles from './Breadcrumbs.module.scss';

export interface PathItem {
  headerId?: UniqueIdentifier;
  selectedId?: UniqueIdentifier;
  label: string;
}

export interface BreadcrumbsProps {
  path: PathItem[];
  navigate: (to: string) => void;
}

interface CrumbProps {
  path: PathItem;
  onClick: () => void;
}

const Crumb: React.FC<CrumbProps> = ({ path, onClick }) => (
  <Button className={styles.Crumb} size="sm" variant="link" onClick={onClick}>
    {path.label}
  </Button>
);

export const Breadcrumbs: React.FC<BreadcrumbsProps> = (props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      requestAnimationFrame(() =>
        ref.current.scrollTo({
          behavior: 'smooth',
          left: ref.current.scrollWidth - ref.current.clientWidth,
        })
      );
    }
  }, [props.path?.length]);

  return (
    <div className={cn(styles.Breadcrumbs)} ref={ref}>
      {props.path
        .map((p, i) => (
          <Crumb
            path={p}
            key={i}
            onClick={() => props.navigate(mapToLink(p))}
          />
        ))
        .flatMap((button, i) =>
          i < props.path.length - 1
            ? [
                button,
                <span key={`sep-${i}`} className={styles.Separator}>
                  {' '}
                  /{' '}
                </span>,
              ]
            : [button]
        )}
    </div>
  );
};

export function mapToLink(p: PathItem): string {
  return `/${p.headerId}${Boolean(p.selectedId) ? `/${p.selectedId}` : ''}`;
}
