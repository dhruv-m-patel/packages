import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { Page, Text, StyleVariables } from '@dhruv-m-patel/react-components';

interface HomePageProps {
  getApiMessage: Function;
  messageFromApi?: string;
  isFetching: boolean;
  error?: string;
}

const useStyles = makeStyles(() => ({
  title: {
    color: StyleVariables.colors.blue,
  },
  loadingMessage: {
    color: StyleVariables.colors.darkGrey,
  },
  error: {
    color: StyleVariables.colors.red,
  },
  main: {
    padding: '5rem 0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAnchorLink: {
    margin: '1rem',
    padding: '1.5rem',
    textAlign: 'left',
    color: 'inherit',
    textDecoration: 'none',
    border: '3px solid #eaeaea',
    borderRadius: '10px',
    transition: 'color 0.15s ease, border-color 0.15s ease',
    width: '45%',
    '&:hover, &:focus, &:active': {
      borderColor: '#0070f3',
    },
    '& h2': {
      margin: '0 0 1rem 0',
      fontSize: '1.5rem',
    },
    '& p': {
      margin: 0,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
  },
  description: {
    lineHeight: '1.5rem',
    fontSize: '1.5rem',
    textAlign: 'center',
  },
  grid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    maxWidth: '800px',
    marginTop: '3rem',
  },
  titleH1: {
    margin: 0,
    lineHeight: 1.15,
    fontSize: '4rem',
    textAlign: 'center',
    '& a': {
      textDecoration: 'none',
    },
    '& a:hover, & a:focus, & a:active': {
      textDecoration: 'underline',
    },
  },
  titleH2: {
    margin: '0 0 1.5rem',
    lineHeight: 1.15,
    fontSize: '2rem',
    textAlign: 'center',
  },
}));

export default function HomePage({
  messageFromApi,
  isFetching = false,
  error,
  getApiMessage,
}: HomePageProps) {
  const classes = useStyles();
  const [message, setMessage] = useState<string | undefined>();

  useEffect(() => {
    if (!isFetching && !error && !messageFromApi) {
      getApiMessage();
    } else if (messageFromApi && !message) {
      setMessage(messageFromApi);
    }
  }, [messageFromApi, isFetching, error, message, getApiMessage]);

  return (
    <Page>
      <div className={classes.main}>
        <Text as="h1" className={classes.titleH1}>
          Welcome to{' '}
          <a href="https://styledreactapp.herokuapp.com">Node React Monorepo</a>
        </Text>
        <br />
        <br />
        <Text as="p" className={classes.description}>
          Featured with reach support of modern tools to build your Node React
          projects
        </Text>

        <div className={classes.grid}>
          <a
            className={classes.cardAnchorLink}
            href="https://www.npmjs.com/package/redux-api-middleware"
          >
            <h2>Monorepo</h2>
            <Text as="p">
              Manage your frontend, backend and packages in one place with Lerna
            </Text>
          </a>

          <a className={classes.cardAnchorLink} href="https://expressjs.com/">
            <Text as="h2">Express</Text>
            <Text as="p">Write microservices with node and express</Text>
          </a>

          <a className={classes.cardAnchorLink} href="https://reactjs.org/">
            <Text as="h2">React</Text>
            <Text as="p">
              Write frontend applications using React (extended with SSR support
              built-in)
            </Text>
          </a>

          <a
            className={classes.cardAnchorLink}
            href="https://reactrouter.com/web/guides/quick-start"
          >
            <Text as="h2">React Router</Text>
            <Text as="p">
              Multi-page applications support with client-side routing using
              react-router-dom
            </Text>
          </a>

          <a
            className={classes.cardAnchorLink}
            href="https://www.npmjs.com/package/confit"
          >
            <Text as="h2">Configuration</Text>
            <Text as="p">
              Hydrate dynamic configuration relevant to different environments
            </Text>
          </a>

          <a
            className={classes.cardAnchorLink}
            href="https://styled-components.com/"
          >
            <Text as="h2">Styled Components</Text>
            <Text as="p">Style your React components with a breeze</Text>
          </a>

          <a className={classes.cardAnchorLink} href="https://redux.js.org/">
            <Text as="h2">Redux</Text>
            <Text as="p">Manage your application state with Redux</Text>
          </a>

          <a
            className={classes.cardAnchorLink}
            href="https://www.npmjs.com/package/redux-api-middleware"
          >
            <Text as="h2">Redux API Middleware</Text>
            <Text as="p">
              Call server apis with ease using redux-api-middleware.
            </Text>
          </a>

          <a
            className={classes.cardAnchorLink}
            href="https://storybook.js.org/docs/react/get-started/introduction"
          >
            <Text as="h2">Storybook</Text>
            <Text as="p">Visualize your react components using Storybook</Text>
          </a>

          <a
            className={classes.cardAnchorLink}
            href="https://enzymejs.github.io/enzyme/"
          >
            <Text as="h2">Jest + Enzyme</Text>
            <Text as="p">Test your react components using Jest and Enzyme</Text>
          </a>
        </div>
        <br />
        <br />
        <Text as="h2" className={classes.titleH2}>
          Frontend References
        </Text>
        <ul>
          <li>
            <a href="https://github.com/dhruv-m-patel/node-react-monorepo/blob/master/react-app/src/server/middleware/renderPage.js">
              React SSR Middleware
            </a>
          </li>
          <li>
            <a href="https://github.com/dhruv-m-patel/node-react-monorepo/blob/master/react-app/src/client/renderApp.js">
              Client App Entrypoint
            </a>
          </li>
          <li>
            <a href="https://github.com/dhruv-m-patel/node-react-monorepo/tree/master/react-app/src/client/redux">
              Redux Integration
            </a>
          </li>
          <li>
            <a href="https://github.com/dhruv-m-patel/node-react-monorepo/blob/master/react-app/src/client/redux/actions.js#L24">
              Example server api call with redux-api-middleware
            </a>
          </li>
          <li>
            <a href="https://github.com/dhruv-m-patel/node-react-monorepo/blob/master/react-app/src/common/components/ReduxExample/ReduxExample.jsx">
              Example component with Redux Integration
            </a>
          </li>
        </ul>
      </div>
    </Page>
  );
}
