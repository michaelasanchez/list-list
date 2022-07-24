import * as React from 'react';
import img from '../public/img/whoa.jpg';
import { Navbar } from './Navbar';

interface AppProps {}

export const App: React.FC<AppProps> = ({}) => {
  // const authState = useAuth();

  return (
    <>
      <Navbar />
      <main>
        <div className="img-container">
          <img src={img} />
        </div>
        <br />
        <h4>
          hi
          {/* {authState.loading
            ? strings.view.app.homeLoadingText
            : !!authState.user
            ? strings.view.app.homeText
            : strings.view.app.homeNoAuthText} */}
        </h4>
      </main>
    </>
  );
};
