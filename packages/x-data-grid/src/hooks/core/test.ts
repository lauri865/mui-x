// Define the Test interface using a generic renderCell function type.
export interface Test<P = undefined> {
  renderCell<S>(params: any, props: S): null;
  renderCellProps?: NoInfer<P>;
}

// Example usage: the type of renderCellProps is inferred from renderCell.
const test: Test = {
  renderCell<{foo: string}>(
    params: any,
    props: {
      foo: string;
    },
  ) {
    return null;
  },
  renderCellProps: { foo: 'bar' },
};
