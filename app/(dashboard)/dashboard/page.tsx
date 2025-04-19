import React, { Suspense } from "react";
import { RecentItemsTable } from "./_components/RecenteItemsTable";
import PopularProductsCard from "./_components/PopularProductsCard";
import TotalStoreValueCard from "./_components/TotalStoreValueCard";
import OutOfStockCard from "./_components/OutOfStock";
import AllCategoriesCard from "./_components/AllCategoriesCard";

const page = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Suspense
          fallback={<div className="aspect-video rounded-xl bg-muted/50" />}
        >
          <TotalStoreValueCard />
        </Suspense>
        <Suspense
          fallback={<div className="aspect-video rounded-xl bg-muted/50" />}
        >
          <OutOfStockCard />
        </Suspense>
        <Suspense
          fallback={<div className="aspect-video rounded-xl bg-muted/50" />}
        >
          <AllCategoriesCard />
        </Suspense>
        <Suspense
          fallback={
            <div className="aspect-video rounded-xl bg-muted/50 md:col-span-3" />
          }
        >
          <div className="md:col-span-3">
            <PopularProductsCard />
          </div>
        </Suspense>
      </div>
      <Suspense
        fallback={<div className="min-h-[500px] rounded-xl bg-muted/50 z-10" />}
      >
        <RecentItemsTable />
      </Suspense>
    </div>
  );
};

export default page;
