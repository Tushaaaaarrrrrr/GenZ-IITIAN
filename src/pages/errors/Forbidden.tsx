import ErrorPage from '../../components/ErrorPage';

export default function Forbidden() {
  return <ErrorPage code={403} />;
}
