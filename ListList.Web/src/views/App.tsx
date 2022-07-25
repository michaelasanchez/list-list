import { map } from 'lodash';
import * as React from 'react';
import { useAuth } from '../hooks';
import { ListItemMapper } from '../mappers';
import { ListNode } from '../models/ListNode';
import { ListItemApi } from '../network';
import img from '../public/img/whoa.jpg';
import { Navbar } from './Navbar';

interface AppProps {}

export const App: React.FC<AppProps> = ({}) => {
  const authState = useAuth();

  const [node, setNode] = React.useState<ListNode>();

  React.useEffect(() => {
    if (!!authState.user) {
      new ListItemApi(authState.user.tokenId)
        .Get()
        .then((resp) => setNode(ListItemMapper.mapToNode(resp)));
    }
  }, [authState]);

  return (
    <>
      <Navbar authState={authState} />
      <main>
        <div className="img-container">
          <img src={img} />
        </div>
        <br />
        <h4>
          {authState.loading
            ? 'loadin'
            : !!authState.user
            ? `hi ${authState.user.username}`
            : 'hey stranger'}
        </h4>
        {map(node?.children, (item, i) => (
          <div key={i}>
            {item.label} ({item.children?.length})
            <button>{item.expanded ? '-' : '+'}</button>
          </div>
        ))}
      </main>
    </>
  );
};
