import { useState, useEffect } from "react";

const FOUR_HOURS = 4 * 60 * 60 * 1000;

const CountdownTimer = () => {
  const getTimeLeft = () => {
    const elapsed = Date.now() % FOUR_HOURS;
    return FOUR_HOURS - elapsed;
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5">
      {[
        { val: pad(hours), label: "ঘন্টা" },
        { val: pad(minutes), label: "মিনিট" },
        { val: pad(seconds), label: "সেকেন্ড" },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="bg-destructive text-destructive-foreground rounded-md px-2 py-1 text-center min-w-[40px]">
            <span className="text-lg font-bold leading-none">{item.val}</span>
            <p className="text-[8px] leading-none mt-0.5">{item.label}</p>
          </div>
          {i < 2 && <span className="text-destructive font-bold text-lg">:</span>}
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
