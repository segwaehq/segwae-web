import { createAdminClient } from "@/lib/adminAuth";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface OrderListItem {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_address?: {
    state: string;
    city: string;
  };
  users?: {
    name: string;
    email: string;
  };
  order_items?: Array<{ id: string; quantity: string }>
  // order_items?: { id: string; quantity: string };
}

export default async function OrdersPage() {
  const supabase = createAdminClient();

  // Fetch orders with order_items, then manually fetch user data
  const { data: ordersData } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  // Fetch user data separately and merge
  let orders = ordersData;
  if (ordersData && ordersData.length > 0) {
    const userIds = [...new Set(ordersData.map((order) => order.user_id))];
    const { data: usersData } = await supabase
      .from("users")
      .select("id, name, email")
      .in("id", userIds);

    // Merge user data into orders
    orders = ordersData.map((order) => ({
      ...order,
      users: usersData?.find((user) => user.id === order.user_id),
    }));
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending_contact: "bg-warningYellow/10 text-warningYellow",
      contacted: "bg-blue/10 text-blue",
      confirmed: "bg-blue/10 text-blue",
      pending_payment: "bg-warningYellow/10 text-warningYellow",
      paid: "bg-successGreen/10 text-successGreen",
      processing: "bg-mainPurple/10 text-mainPurple",
      shipped: "bg-mainPurple/10 text-mainPurple",
      delivered: "bg-successGreen/10 text-successGreen",
      cancelled: "bg-errorRed/10 text-errorRed",
    };
    return styles[status as keyof typeof styles] || styles.pending_contact;
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  console.log(orders)

  return (
    <div>
      <h1 className="font-satoshi font-black text-4xl mb-8">Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <p className="font-spaceGrotesk text-xl text-grey2">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: OrderListItem) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`}>
              <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-spaceGrotesk font-bold text-xl">
                        {order.order_number}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-spaceGrotesk font-semibold ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-grey2 font-openSans">
                      <p>
                        Customer: {order.users?.name || "N/A"} (
                        {order.users?.email})
                      </p>
                      <p>Items: {order.order_items?.at(0)?.quantity || 0}</p>
                      <p>
                        Total: ₦
                        {((order.total_amount || 0) / 100).toLocaleString()}
                      </p>
                      <p>
                        Ordered: {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 text-grey3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                {order.delivery_address && (
                  <div className="bg-grey6 rounded-xl p-4">
                    <p className="font-spaceGrotesk font-semibold text-sm mb-2">
                      Delivery Address:
                    </p>
                    <p className="font-openSans text-sm text-grey1">
                      {order.delivery_address.state} State,{" "}
                      {order.delivery_address.city}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
