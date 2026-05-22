import {
  LifestyleSurveyView,
  type LifestyleSurveyViewProps,
} from './lifestyle-survey.view';
import {
  useLifestyleSurvey,
  type UseLifestyleSurveyProps,
} from './use-lifestyle-survey';

export type LifestyleSurveyProps = UseLifestyleSurveyProps &
  Omit<
    LifestyleSurveyViewProps,
    keyof ReturnType<typeof useLifestyleSurvey>
  >;

export function LifestyleSurvey({
  value,
  defaultValue,
  onValueChange,
  disabled,
  ...rest
}: LifestyleSurveyProps) {
  const asks = useLifestyleSurvey({
    value,
    defaultValue,
    onValueChange,
    disabled,
  });
  return <LifestyleSurveyView {...asks} {...rest} />;
}
