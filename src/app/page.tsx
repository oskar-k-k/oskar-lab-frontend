import Image from "next/image";
import Button from "@/components/Buttons/Button";
import Grid from "@/components/Grids/Grid";

export default function Home() {
  return (
    <div className="h-100">
      
        
        <Grid>
          <Button disabled className="w-20 h-20">AS</Button>
          <Button className="w-20 h-20">2</Button>
          <Button className="w-20 h-20">AasdasdS</Button>
          <Button className="w-20 h-20">3</Button>
          <Button className="w-20 h-20">AaS</Button>
        </Grid>
    </div>
  );
}
