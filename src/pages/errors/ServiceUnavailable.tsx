import ErrorPage from '../../components/ErrorPage';

export default function ServiceUnavailable() {
  return <ErrorPage code={503} showReload />;
}
