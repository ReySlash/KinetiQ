import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CapDemandTableProp = {
  type: "Capabilities" | "Demands";
  headers: string[];
  values: (number | string | null)[];
};

export default function StatsTable(props: CapDemandTableProp) {
  const { headers, values, type } = props;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{type}</TableHead>
          <TableHead className="text-right">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {values?.slice(0, values.length - 1).map((val, index) => (
          <TableRow key={headers[index] + val?.toString()}>
            <TableCell>{headers[index]}</TableCell>
            <TableCell className="text-right">{val}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
