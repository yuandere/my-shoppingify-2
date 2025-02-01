import { Plus, Minus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListItem, ListsViewList } from "@/types/dashboard";

interface ICartListItemProps {
  item: ListItem;
  isExpanded: boolean;
  onItemClick: (itemId: number) => void;
  itemId: number;
  handleChecked: (listItemId: number, checked: boolean) => void;
  handleDeleteListItem: (listItemId: number) => void;
  handleChangeQuantity: (listItemId: number, quantity: number) => void;
  listQueryData: ListsViewList | undefined;
  localQuantity?: number;
  localChecked?: boolean;
}

export default function CartListItem({
  item,
  isExpanded,
  onItemClick,
  itemId,
  handleChecked,
  handleDeleteListItem,
  handleChangeQuantity,
  listQueryData,
  localQuantity,
  localChecked,
}: ICartListItemProps) {
  const quantity = localQuantity ?? item.quantity;
  const checked = localChecked ?? item.checked;

  return (
    <div
      data-cart-item
      className={`overflow-hidden rounded-lg transition-all duration-200 ${
        isExpanded ? "hover:bg-muted" : ""
      }`}
    >
      <div
        onClick={() => onItemClick(itemId)}
        className={`cursor-pointer p-2 transition-all duration-200 ${
          isExpanded ? "bg-muted" : "hover:bg-muted"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                className="rounded border-muted"
                checked={checked}
                onChange={(e) => {
                  handleChecked(item.id, e.target.checked);
                }}
              />
            </div>
            <span
              className={listQueryData?.completed ? "text-muted-foreground" : ""}
            >
              {item.name}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 transition-all duration-200 ${
              isExpanded
                ? "opacity-0 translate-y-2"
                : "opacity-100 translate-y-0"
            }`}
          >
            <span className="text-sm text-muted-foreground">{quantity}pcs</span>
          </div>
        </div>
      </div>
      <div
        className={`grid transition-all duration-200 ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`flex items-center justify-between gap-2 p-2 pt-0 transition-all duration-200 ${
              isExpanded ? "bg-muted" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteListItem(item.id);
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangeQuantity(item.id, quantity - 1);
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-[2rem] text-center">{quantity}</span>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangeQuantity(item.id, quantity + 1);
                }}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={quantity >= 99}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
