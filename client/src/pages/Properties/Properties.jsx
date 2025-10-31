// import React, { useState } from "react";
// import SearchBar from "../../components/SearchBar/SearchBar";
// import "./Properties.css";
// import useProperties from "../../hooks/useProperties";
// import { PuffLoader } from "react-spinners";
// import PropertyCard from "../../components/PropertyCard/PropertyCard";
// import { matchesPropertyFilter } from "../../utils/common";
// const Properties = () => {
//   const { data, isError, isLoading } = useProperties();
//   const [filter, setFilter] = useState("");
//   if (isError) {
//     return (
//       <div className="wrapper">
//         <span>Error while fetching data</span>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="wrapper flexCenter" style={{ height: "60vh" }}>
//         <PuffLoader
//           height="80"
//           width="80"
//           radius={1}
//           color="#4066ff"
//           aria-label="puff-loading"
//         />
//       </div>
//     );
//   }
//   return (
//     <div className="wrapper">
//       <div className="flexColCenter paddings innerWidth properties-container">
//         <SearchBar filter={filter} setFilter={setFilter} />

//         <div className="paddings flexCenter properties">
//           {
//             // data.map((card, i)=> (<PropertyCard card={card} key={i}/>))

//             data
//               .filter((property) => matchesPropertyFilter(property, filter))
//               .map((card, i) => (
//                 <PropertyCard card={card} key={i} />
//               ))
//           }
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Properties;
import React, { useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import "./Properties.css";
import useProperties from "../../hooks/useProperties";
import { PuffLoader } from "react-spinners";
import PropertyCard from "../../components/PropertyCard/PropertyCard";
import { matchesPropertyFilter } from "../../utils/common";
import { useLocation } from "react-router-dom"; // <-- 1. IMPORT ADDED

const Properties = () => {
  const { data, isError, isLoading } = useProperties();
  
  // 2. GET LOCATION STATE
  const { state } = useLocation();

  // 3. SET INITIAL FILTER FROM LOCATION STATE
  const [filter, setFilter] = useState(state?.filter || "");

  if (isError) {
    return (
      <div className="wrapper">
        <span>Error while fetching data</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="wrapper flexCenter" style={{ height: "60vh" }}>
        <PuffLoader
          height="80"
          width="80"
          radius={1}
          color="#4066ff"
          aria-label="puff-loading"
        />
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="flexColCenter paddings innerWidth properties-container">
        {/* This will now show the search term from the homepage */}
        <SearchBar filter={filter} setFilter={setFilter} />

        <div className="paddings flexCenter properties">
          {
            // data.map((card, i)=> (<PropertyCard card={card} key={i}/>))

            data
              .filter((property) => matchesPropertyFilter(property, filter))
              .map((card, i) => (
                <PropertyCard card={card} key={i} />
              ))
          }
        </div>
      </div>
    </div>
  );
};

export default Properties;