import React, { useState } from "react";

const SearchScreen = () => {
  const [keywords, setKeywords] = useState<string>("");
  return (
    <div className="w-full flex absolute top-30 left-115">
      <input className="bg-white w-1/3"></input>
    </div>
  );
};

export default SearchScreen;
