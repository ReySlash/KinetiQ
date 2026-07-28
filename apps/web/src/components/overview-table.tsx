import { Table, TableBody, TableCell, TableRow } from "./ui/table";

type OverviewTableProps = {
  headers: string[];
  values: Array<string | number | null>;
};

export default function OverviewTable(props: OverviewTableProps) {
  const { headers, values } = props;
  return (
    <Table className="table-fixed">
      <colgroup>
        <col className="w-2/3"></col>
        <col className="w-1/3 "></col>
      </colgroup>
      <TableBody>
        {headers.map((header, index) => (
          <TableRow key={index}>
            <TableCell>{header}</TableCell>
            <TableCell className="text-muted-foreground whitespace-normal">
              - {values[index]}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
