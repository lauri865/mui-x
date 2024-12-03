import * as React from 'react';
import { createRenderer, act } from '@mui/internal-test-utils';
import { expect } from 'chai';
import {
  DataGridPremium as DataGrid,
  DataGridPremiumProps as DataGridProps,
  GridApi,
  GridToolbar,
  useGridApiRef,
} from '@mui/x-data-grid-premium';
import { getColumnValues, sleep } from 'test/utils/helperFn';
import { spy } from 'sinon';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

describe('<DataGrid /> - Quick filter', () => {
  const { render } = createRenderer();

  const baselineProps = {
    autoHeight: isJSDOM,
    disableVirtualization: true,
    rows: [
      {
        id: 0,
        brand: 'Nike',
      },
      {
        id: 1,
        brand: 'Adidas',
      },
      {
        id: 2,
        brand: 'Puma',
      },
    ],
    columns: [{ field: 'brand' }],
  };

  let apiRef: React.MutableRefObject<GridApi>;

  function TestCase(props: Partial<DataGridProps>) {
    apiRef = useGridApiRef();

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGrid
          {...baselineProps}
          apiRef={apiRef}
          slots={{ toolbar: GridToolbar }}
          disableColumnSelector
          disableDensitySelector
          disableColumnFilter
          {...props}
          slotProps={{
            ...props?.slotProps,
            toolbar: {
              showQuickFilter: true,
              ...props?.slotProps?.toolbar,
            },
          }}
        />
      </div>
    );
  }

  // https://github.com/mui/mui-x/issues/9677
  it('should not fail when adding a grouping criterion', () => {
    const { setProps } = render(
      <TestCase
        rows={[
          {
            id: 1,
            company: '20th Century Fox',
            director: 'James Cameron',
            year: 1999,
            title: 'Titanic',
          },
        ]}
        columns={[
          { field: 'company' },
          { field: 'director' },
          { field: 'year' },
          { field: 'title' },
        ]}
        initialState={{
          rowGrouping: {
            model: ['company'],
          },
          aggregation: {
            model: {
              director: 'size',
            },
          },
        }}
      />,
    );

    act(() => apiRef.current.addRowGroupingCriteria('year'));

    setProps({
      filterModel: {
        items: [],
        quickFilterValues: ['Cameron'],
      },
    });

    expect(getColumnValues(0)).to.deep.equal(['20th Century Fox (1)', '']);
  });
});

describe('<DataGrid /> - unmount cleanup', () => {
  const { render } = createRenderer();

  const baselineProps = {
    autoHeight: isJSDOM,
    disableVirtualization: true,
    rows: [
      {
        id: 0,
        brand: 'Nike',
      },
      {
        id: 1,
        brand: 'Adidas',
      },
      {
        id: 2,
        brand: 'Puma',
      },
    ],
    columns: [{ field: 'brand' }],
  };

  let apiRef: React.MutableRefObject<GridApi>;

  function Test({
    onUnmount,
    ...props
  }: Partial<DataGridProps> & {
    onUnmount?: (params: any) => void;
  }) {
    apiRef = useGridApiRef();

    React.useEffect(() => {
      // @ts-ignore
      return apiRef.current.subscribeEvent('testUnmount', onUnmount);
    }, []);

    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGrid {...baselineProps} apiRef={apiRef} {...props} />
      </div>
    );
  }

  it('should cleanup the apiRef when unmounting', async () => {
    const onUnmount = spy();
    const { setProps, unmount } = render(<Test onUnmount={onUnmount} />);

    expect(apiRef.current).to.not.equal(undefined);
    unmount();
    expect(apiRef.current).to.equal(null);
    expect(onUnmount.callCount).to.equal(1);

    const params = onUnmount.args[0][0];
    const publicApiWeakRef = params.publicApi;
    const privateApiWeakRef = params.privateApi;
    const instanceIdWeakRef = params.instanceId;

    await sleep(100);

    expect(instanceIdWeakRef.deref()).to.equal(undefined);
    expect(publicApiWeakRef.deref()).to.equal(undefined);
    expect(privateApiWeakRef.deref()).to.equal(undefined);
  });
});
