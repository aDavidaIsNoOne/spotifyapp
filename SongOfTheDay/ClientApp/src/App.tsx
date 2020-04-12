import Home from './components/Home/Home';
import React, { Fragment } from 'react';

import { Route } from 'react-router';

const App = () => {
  return (
    <Fragment>
      <Route exact path="/" component={Home} />
    </Fragment>
  );
};

export default App;
