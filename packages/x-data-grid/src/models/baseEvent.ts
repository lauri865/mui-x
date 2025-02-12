import * as React from 'react';

export type TwgBaseEvent =
  | React.SyntheticEvent<HTMLElement>
  | DocumentEventMap[keyof DocumentEventMap]
  | {};

export type TwgEvent<E extends TwgBaseEvent = TwgBaseEvent> = E & {
  defaultTwgPrevented?: boolean;
};
