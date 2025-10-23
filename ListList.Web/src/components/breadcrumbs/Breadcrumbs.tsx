import cn from 'classnames';
import React from 'react';
import { Button } from 'react-bootstrap';
import { Icon } from '../icon';
import * as styles from './Breadcrumbs.module.scss';

export interface PathItem {
  headerId?: string;
  selectedId?: string;
  label?: string;
  icon?: never;
}

export interface BreadcrumbsProps {
  path: PathItem[];
  navigate: (token?: string, selectedId?: string) => void;
}

interface CrumbProps {
  path: PathItem;
  onClick: () => void;
}

const Crumb: React.FC<CrumbProps> = ({ path, onClick }) => (
  <Button className={styles.Crumb} size="sm" variant="link" onClick={onClick}>
    {path.label}
    {Boolean(path.icon) && <Icon type={path.icon} />}
  </Button>
);

const Separator: React.FC = () => <span className={styles.Separator}> / </span>;

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

  const crumbs = props.path.map((p, i) => (
    <Crumb
      key={i}
      path={p}
      onClick={() => props.navigate(p.headerId, p.selectedId)}
    />
  ));

  return (
    <div className={cn(styles.Breadcrumbs)} ref={ref}>
      {crumbs.flatMap((crumb, i) =>
        i < crumbs.length - 1
          ? [crumb, <Separator key={`sep-${i}`} />]
          : [crumb]
      )}
    </div>
  );
};
