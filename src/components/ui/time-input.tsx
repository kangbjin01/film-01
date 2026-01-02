'use client';

import * as React from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// 빠른 선택용 시간 목록
const QUICK_HOURS = ['05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'];
const QUICK_MINUTES = ['00', '15', '30', '45'];

export function TimeInput({ 
  value, 
  onChange, 
  placeholder = '00:00',
  className,
  disabled 
}: TimeInputProps) {
  const [open, setOpen] = React.useState(false);
  const [hours, setHours] = React.useState('00');
  const [minutes, setMinutes] = React.useState('00');
  
  // value가 변경되면 hours와 minutes 업데이트
  React.useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      setHours(h || '00');
      setMinutes(m || '00');
    } else if (!value) {
      setHours('00');
      setMinutes('00');
    }
  }, [value]);
  
  const updateValue = (newHours: string, newMinutes: string) => {
    const h = newHours.padStart(2, '0');
    const m = newMinutes.padStart(2, '0');
    onChange(`${h}:${m}`);
  };
  
  const incrementHours = () => {
    const num = parseInt(hours, 10);
    const newVal = (num + 1) > 23 ? 0 : num + 1;
    const padded = newVal.toString().padStart(2, '0');
    setHours(padded);
    updateValue(padded, minutes);
  };
  
  const decrementHours = () => {
    const num = parseInt(hours, 10);
    const newVal = (num - 1) < 0 ? 23 : num - 1;
    const padded = newVal.toString().padStart(2, '0');
    setHours(padded);
    updateValue(padded, minutes);
  };
  
  const incrementMinutes = () => {
    const num = parseInt(minutes, 10);
    const newVal = (num + 5) > 59 ? 0 : num + 5;
    const padded = newVal.toString().padStart(2, '0');
    setMinutes(padded);
    updateValue(hours, padded);
  };
  
  const decrementMinutes = () => {
    const num = parseInt(minutes, 10);
    const newVal = (num - 5) < 0 ? 55 : num - 5;
    const padded = newVal.toString().padStart(2, '0');
    setMinutes(padded);
    updateValue(hours, padded);
  };
  
  const selectHour = (h: string) => {
    setHours(h);
    updateValue(h, minutes);
  };
  
  const selectMinute = (m: string) => {
    setMinutes(m);
    updateValue(hours, m);
    setOpen(false);
  };
  
  const displayValue = value || placeholder;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-mono text-sm h-9",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span>{displayValue}</span>
          <Clock className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-4">
          {/* 시간 조절 UI */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {/* 시간 */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={incrementHours}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <div className="text-3xl font-mono font-bold w-14 text-center py-2 bg-muted rounded-md">
                {hours}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={decrementHours}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            
            <span className="text-3xl font-bold text-muted-foreground">:</span>
            
            {/* 분 */}
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={incrementMinutes}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <div className="text-3xl font-mono font-bold w-14 text-center py-2 bg-muted rounded-md">
                {minutes}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={decrementMinutes}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 빠른 선택 */}
          <div className="border-t pt-3">
            <p className="text-xs text-muted-foreground mb-2">빠른 선택</p>
            
            {/* 시간 빠른 선택 */}
            <div className="flex flex-wrap gap-1 mb-2">
              {QUICK_HOURS.map((h) => (
                <Button
                  key={h}
                  variant={hours === h ? "default" : "outline"}
                  size="sm"
                  className="h-7 w-9 text-xs font-mono"
                  onClick={() => selectHour(h)}
                >
                  {h}
                </Button>
              ))}
            </div>
            
            {/* 분 빠른 선택 */}
            <div className="flex gap-1">
              {QUICK_MINUTES.map((m) => (
                <Button
                  key={m}
                  variant={minutes === m ? "default" : "outline"}
                  size="sm"
                  className="h-7 flex-1 text-xs font-mono"
                  onClick={() => selectMinute(m)}
                >
                  :{m}
                </Button>
              ))}
            </div>
          </div>
          
          {/* 확인 버튼 */}
          <div className="border-t mt-3 pt-3">
            <Button 
              className="w-full" 
              size="sm"
              onClick={() => setOpen(false)}
            >
              확인
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
