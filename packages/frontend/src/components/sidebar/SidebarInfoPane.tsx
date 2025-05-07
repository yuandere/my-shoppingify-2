import { useContext, useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
  DialogClose,
} from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import { ChevronLeft, Pencil, Plus, Trash, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { SidebarRightContext } from "@/shared/SidebarRightContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { deleteCategory, addCategory } from "@/lib/actions/categories";
import { addItem, deleteItem, updateItem } from "@/lib/actions/items";
import { createList } from "@/lib/actions/lists";
import { queryClient } from "@/lib/queryClient";
import { categoriesQueryOptions, itemsQueryOptions } from "@/lib/queryOptions";
import type { Category, Item, ListsViewList } from "@/types/dashboard";
import { itemSchema, ItemFormValues } from "@/types/schema";

interface ISidebarInfoPane {
  selectedItem: Item | null;
  addingNewItem: boolean;
}

const DialogWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative z-50">
    <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
    {children}
  </div>
);

function SidebarInfoPane({ selectedItem, addingNewItem }: ISidebarInfoPane) {
  const categoriesQuery = useSuspenseQuery(categoriesQueryOptions());
  const itemsQuery = useSuspenseQuery(itemsQueryOptions());
  const [categories, setCategories] = useState(categoriesQuery.data);
  const [isAddingNewCategory, setIsAddingNewCategory] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  const sidebarRightContext = useContext(SidebarRightContext);
  const setInfoPaneOpen = sidebarRightContext?.setInfoPaneOpen || (() => {});
  const setAddingNewItem = sidebarRightContext?.setAddingNewItem || (() => {});
  const setSelecteditem = sidebarRightContext?.setSelectedItem || (() => {});
  const selectedListId = sidebarRightContext?.selectedListId;
  const handleAddItemToList =
    sidebarRightContext?.handleAddItemToList || (() => {});

  const defaultValues = addingNewItem
    ? {
        id: 0,
        name: "",
        image_url: "",
        description: null,
        category_name: categories[0]?.name || null,
        category_id: categories[0]?.id || null,
      }
    : selectedItem || undefined;

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues,
  });

  useEffect(() => {
    setCategories(categoriesQuery.data);
  }, [categoriesQuery.data]);

  useEffect(() => {
    const values = addingNewItem
      ? {
          id: 0,
          name: "",
          image_url: "",
          description: null,
          category_name: categories[0]?.name || null,
          category_id: categories[0]?.id || null,
        }
      : selectedItem || undefined;

    form.reset(values);
  }, [selectedItem, addingNewItem, categories, form]);

  const onClose = () => {
    setAddingNewItem(false);
    setInfoPaneOpen(false);
  };

  const onDeleteItem = async () => {
    if (!selectedItem) return;
    try {
      await deleteItem(selectedItem.id);
      await Promise.resolve(
        queryClient.invalidateQueries({ queryKey: ["items"] })
      );
      setInfoPaneOpen(false);
      toast.success("Item deleted");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting item");
    }
  };

  const handleAddItemToNewList = async () => {
    if (isSubmitting || !selectedItem) return;
    setIsSubmitting(true);
    let newList = null;
    try {
      const data = await createList(selectedItem);
      // console.log("New list created:", data);
      newList = data as ListsViewList;
    } catch (error) {
      console.error(error);
      toast.error("Error creating list");
      return;
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["lists"] });
      sidebarRightContext?.setSelectedListId(newList?.id ?? null);
      setIsSubmitting(false);
      onClose();
      toast.success("List created");
    }
  };

  const onSubmit = async (updatedData: ItemFormValues) => {
    if (!selectedItem) return;
    try {
      await updateItem(selectedItem.id, updatedData);
      // console.log("Updated item submitted:", updatedData);
    } catch (error) {
      console.error(error);
      toast.error("Error updating item");
      return;
    }
    queryClient.setQueryData(["items"], (oldData: Item[]) => {
      const newData = [];
      for (const item of oldData) {
        if (item.id !== selectedItem.id) {
          newData.push(item);
        } else {
          newData.push(updatedData);
        }
      }
      return newData;
    });
    toast.success("Item updated");
  };
  const onSubmitNewItem = async (newItemData: ItemFormValues) => {
    try {
      await addItem(newItemData);
    } catch (error) {
      console.error(error);
      toast.error("Error adding item");
      return;
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["items"] });
      setAddingNewItem(false);
      setSelecteditem(null);
      setInfoPaneOpen(false);
      toast.success("Item added");
    }
  };
  const handleSubmit = (values: ItemFormValues) => {
    values.name = values.name.trim();
    // console.log("form values", values);
    for (const item of itemsQuery.data) {
      if (item.name === values.name && item.id !== values.id) {
        toast.error("Item with that name already exists");
        return;
      }
    }
    if (addingNewItem) {
      onSubmitNewItem(values);
      return;
    } else {
      onSubmit(values);
    }
  };

  const onAddCategory = async (newCategoryName: string): Promise<Category> => {
    const { data }: { data: Category } = await addCategory(newCategoryName);
    setCategories((prev) => [...prev, data]);
    return data;
  };
  const handleAddNewCategory = async () => {
    if (newCategoryName.trim()) {
      for (const category of categories) {
        if (category.name === newCategoryName.trim()) {
          toast.error("Category already exists");
          return;
        }
      }
      setIsSubmitting(true);
      try {
        const addedCategory = await onAddCategory(newCategoryName.trim());
        if (addedCategory) {
          await queryClient.invalidateQueries({ queryKey: ["categories"] });
          setNewCategoryName("");
          setIsAddingNewCategory(false);
        }
      } catch (error) {
        console.error("Failed to add category:", error);
        toast.error("Failed to add category");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const onDeleteCategory = async (categoryIdToDelete: number) => {
    const res: { status: number; error?: string } =
      await deleteCategory(categoryIdToDelete);
    if (res.error) {
      console.error(res.error);
      toast.error("Error deleting category");
    }
    setCategories((prev) =>
      prev.filter((category) => category.id !== categoryIdToDelete)
    );
    toast.success("Category deleted");
  };
  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await onDeleteCategory(categoryId);
    } catch (error) {
      console.error(error);
      toast.error("Error deleting category");
      return;
    } finally {
      await queryClient.invalidateQueries({
        queryKey: ["categories", "items"],
      });
    }
    if (form.getValues("category_id") === categoryId) {
      form.setValue("category_name", "Uncategorized");
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <ScrollArea className="flex-1 min-h-0 flex flex-col">
          <div className="p-4 space-y-4">
            <Button variant="ghost" onClick={onClose} className="mb-2">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4 flex flex-col"
                autoComplete="off"
                onReset={onClose}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer">
                              {field.value ? (
                                <img
                                  src={field.value}
                                  alt={form.getValues("name")}
                                  width={271}
                                  height={192}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                  Click to add image
                                </div>
                              )}
                            </div>
                          </DialogTrigger>
                          <DialogWrapper>
                            <DialogContent
                              className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md rounded-lg border bg-background p-6 shadow-lg duration-200"
                              aria-describedby="url-input"
                            >
                              <DialogHeader className="space-y-3">
                                <DialogTitle className="text-xl">
                                  Manage Image
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <DialogDescription>
                                  Enter an image URL
                                </DialogDescription>
                                <Input
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value || null);
                                  }}
                                  placeholder="https://images.pexels.com/..."
                                  id="url-input"
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                      form.setValue("image_url", "")
                                    }
                                  >
                                    Remove Image
                                  </Button>
                                  <DialogClose asChild>
                                    <Button type="button">Confirm</Button>
                                  </DialogClose>
                                </div>
                              </div>
                            </DialogContent>
                          </DialogWrapper>
                        </Dialog>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                            >
                              {field.value}
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogWrapper>
                            <DialogContent
                              className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md rounded-lg border bg-background p-6 shadow-lg duration-200"
                              aria-describedby="category-radio-group"
                            >
                              <DialogHeader className="flex flex-row justify-between items-center">
                                <DialogTitle className="text-xl">
                                  Category
                                </DialogTitle>
                                <DialogClose asChild>
                                  <Button
                                    className="h-8 w-8 -translate-y-2"
                                    type="button"
                                    variant="ghost"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </DialogClose>
                              </DialogHeader>
                              <div className="mt-4 space-y-4">
                                <DialogDescription>
                                  Select or add a category
                                </DialogDescription>
                                <RadioGroup
                                  value={field.value ?? undefined}
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    const selectedCategory = categories.find(
                                      (cat) => cat.name === value
                                    );
                                    if (selectedCategory) {
                                      form.setValue(
                                        "category_id",
                                        selectedCategory.id
                                      );
                                    }
                                  }}
                                  id="category-radio-group"
                                  className="space-y-1"
                                >
                                  {categories.map((category) => (
                                    <div
                                      key={`category-${category.id}`}
                                      className="flex items-center justify-between rounded-md border p-2"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                          value={category.name}
                                          id={category.name}
                                        />
                                        <Label
                                          htmlFor={category.name}
                                          className="text-sm font-medium"
                                        >
                                          {category.name}
                                        </Label>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={
                                          category.name === "Uncategorized"
                                        }
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleDeleteCategory(category.id);
                                        }}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </RadioGroup>

                                {isAddingNewCategory ? (
                                  <div className="flex items-center space-x-2 mt-4">
                                    <Input
                                      value={newCategoryName}
                                      onChange={(e) =>
                                        setNewCategoryName(e.target.value)
                                      }
                                      placeholder="New category name"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleAddNewCategory();
                                        }
                                      }}
                                    />
                                    <Button
                                      onClick={handleAddNewCategory}
                                      disabled={
                                        isSubmitting || !newCategoryName.trim()
                                      }
                                    >
                                      {isSubmitting ? "Adding..." : "Add"}
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    onClick={() => setIsAddingNewCategory(true)}
                                    className="mt-4 w-full"
                                    variant="outline"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Category
                                  </Button>
                                )}
                              </div>
                            </DialogContent>
                          </DialogWrapper>
                        </Dialog>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grow" id="grower"></div>
              </form>
            </Form>
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 flex flex-col gap-2">
        {addingNewItem ? (
          <Button type="submit" className="w-full">
            Add Item
          </Button>
        ) : form.formState.isDirty ? (
          <Button type="submit" className="w-full">
            Submit Changes
          </Button>
        ) : selectedListId ? (
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              if (!selectedItem) return;
              handleAddItemToList({
                itemId: selectedItem.id,
                itemName: selectedItem.name,
                category_name: selectedItem.category_name ?? undefined,
              });
            }}
          >
            Add to selected List
          </Button>
        ) : (
          <Button
            type="button"
            className="w-full"
            onClick={() => handleAddItemToNewList()}
          >
            Add to new List
          </Button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full"
              disabled={addingNewItem}
            >
              Delete Item
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Click continue to confirm deletion.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDeleteItem}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

export default SidebarInfoPane;
