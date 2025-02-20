import clsx from 'clsx';
import React, { useRef } from 'react';
import { AggregationMenuOptions, getAvailableAggregations } from '../../../components';
import { GridApiCommon, GridCellParams } from '../../../models';
import { useGridSelector } from '../../utils';
import { useGridPrivateApiContext } from '../../utils/useGridPrivateApiContext';
import { useGridRootProps } from '../../utils/useGridRootProps';
import { gridAggregationLookupSelector } from './gridAggregationSelector';

interface AggregationCellProps {
  params: GridCellParams<any, any, any, any>;
  aggregation: ReturnType<GridApiCommon['getColumnAggregation']>;
  formattedValue: React.ReactNode;
}

export const GridAggregationCell: React.FC<AggregationCellProps> = ({ params, aggregation }) => {
  const { slots } = useGridRootProps();
  const apiRef = useGridPrivateApiContext();
  const triggerRef = useRef<HTMLButtonElement>(null);
  useGridSelector(apiRef, gridAggregationLookupSelector);
  const formattedValue = apiRef.current.getCellParams(params.id, params.field)
    .formattedValue as React.ReactNode;
  const availableAggregations = getAvailableAggregations(params.colDef, apiRef);

  if (!availableAggregations.length) {
    return null;
  }

  return (
    <div className={clsx('aggregation-cell flex gap-2 w-full items-center justify-between')}>
      <slots.baseDropdownMenu.Root
        onOpenChange={(open) => {
          const el = apiRef.current.getCellElement(params.id, params.field);
          if (!el) {return;}
          if (open) {
            el.dataset.open = 'true';
          } else {
            el.removeAttribute('data-open');
            el.focus();
          }
        }}
      >
        <slots.baseDropdownMenu.Trigger
          tabIndex={-1}
          className="outline-0 group/menu"
          data-menu="aggregation"
          ref={triggerRef}
          onFocus={(event) => {
            const el = apiRef.current.getCellElement(params.id, params.field);
            el?.focus();
          }}
        >
          {aggregation ? (
            <slots.baseBadge data-variant="aggregation">
              {aggregation.function.footerLabel}
            </slots.baseBadge>
          ) : (
            <slots.baseBadge
              data-variant="aggregation"
              className={clsx(
                'opacity-0 group-hover/cell:opacity-100 !px-1.5 !h-7 group-data-[state=open]/menu:opacity-100 shadow-xs',
                // params.hasFocus && 'opacity-100',
              )}
            >
              Aggregate
            </slots.baseBadge>
          )}
        </slots.baseDropdownMenu.Trigger>
        <slots.baseDropdownMenu.Content sideOffset={-8}>
          <AggregationMenuOptions
            field={params.field}
            availableAggregations={getAvailableAggregations(params.colDef, apiRef)}
          />
        </slots.baseDropdownMenu.Content>
      </slots.baseDropdownMenu.Root>
      {aggregation && <div>{formattedValue}</div>}
    </div>
  );
};
