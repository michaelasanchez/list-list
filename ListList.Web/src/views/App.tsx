import * as React from 'react';
import { useAuth } from '../hooks';
import { ListItemMapper } from '../mappers';
import { ListItemApi } from '../network';
import img from '../public/img/whoa.jpg';
import { Navbar } from './Navbar';

interface AppProps {}

export const App: React.FC<AppProps> = ({}) => {
  const authState = useAuth();

  React.useEffect(() => {
    if (!!authState.user) {
      const apiListItems = new ListItemApi(authState.user.tokenId)
        .Get()
        .then((resp) => {
          console.log(resp);

          const node = ListItemMapper.mapToNode(resp);
          console.log(node);
        });
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
      </main>
    </>
  );
};
