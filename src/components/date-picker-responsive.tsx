"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { ptBR } from 'date-fns/locale';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarProps } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

interface DatePickerResponsiveProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  calendarProps?: CalendarProps;
}

export function DatePickerResponsive({ date, setDate, calendarProps = {} }: DatePickerResponsiveProps) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const handleSelectDate = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setOpen(false); // Close drawer/popover on date select
  };

  const TriggerButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => (
    <Button
      type="button"
      variant={"outline"}
      className={cn(
        "w-full justify-start text-left font-normal",
        !date && "text-muted-foreground"
      )}
      ref={ref}
      {...props}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
    </Button>
  ));
  TriggerButton.displayName = 'TriggerButton';


  const CalendarComponent = () => (
     <Calendar
        mode="single"
        selected={date}
        onSelect={handleSelectDate}
        initialFocus
        locale={ptBR}
        className={cn(!isDesktop && "w-full border-0")}
        classNames={{
          months: cn(!isDesktop && "w-full"),
          month: cn(!isDesktop && "w-full space-y-6"),
          table: cn(!isDesktop && "w-full border-separate border-spacing-2"),
          head_cell: cn(!isDesktop && "w-auto text-lg"),
          row: cn(!isDesktop && "flex w-full mt-2"),
          cell: cn(!isDesktop && "h-14 w-14 text-center text-lg p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20"),
          day: cn("h-14 w-14 p-0 font-normal aria-selected:opacity-100 text-lg", !isDesktop && "h-14 w-14 text-lg"),
          caption_label: cn(!isDesktop && "text-2xl"),
          nav_button: cn(!isDesktop && "h-10 w-10"),
        }}
        {...calendarProps}
      />
  )

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <TriggerButton />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <CalendarComponent />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <TriggerButton />
      </DrawerTrigger>
      <DrawerContent>
         <DrawerHeader className="sr-only">
          <DrawerTitle>Seletor de Data</DrawerTitle>
          <DrawerDescription>Selecione uma data no calendário.</DrawerDescription>
        </DrawerHeader>
         <div className="mt-4 flex items-center justify-center min-h-[50vh] p-4">
          <CalendarComponent />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
