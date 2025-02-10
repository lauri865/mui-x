import clsx from 'clsx';
import { useThemedComponent } from '../context/GridThemeContext';

function GridScrollbarFillerCell({
  header,
  borderTop = true,
  borderBottom,
  pinnedRight,
}: {
  header?: boolean;
  borderTop?: boolean;
  borderBottom?: boolean;
  pinnedRight?: boolean;
}) {
  const classes = useThemedComponent('scrollbarFiller');
  return <div role="presentation" className={clsx(classes.root)} />;
}

export { GridScrollbarFillerCell };
