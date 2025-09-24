import type { ResourceImageAndDateProps } from "../Interfaces/Props";

const ResouceImageAndDate=({imgUrl,imgAlt,selectedDate}:ResourceImageAndDateProps)=>{
return(
    <>
    <img src={imgUrl} alt={imgAlt}/>
    <div className="selectedDate">{selectedDate}</div>
  </>
)
}
export default ResouceImageAndDate;