import { GridCallbackDetails } from '../api/gridCallbackDetails';
import { TwgBaseEvent, TwgEvent } from '../baseEvent';
import { GridEventLookup, GridEvents } from './gridEventLookup';

export type GridEventListener<E extends GridEvents> = (
  params: GridEventLookup[E] extends { params: any } ? GridEventLookup[E]['params'] : undefined,
  event: GridEventLookup[E] extends { event: TwgBaseEvent }
    ? TwgEvent<GridEventLookup[E]['event']>
    : TwgEvent<{}>,
  details: GridCallbackDetails,
) => void;
