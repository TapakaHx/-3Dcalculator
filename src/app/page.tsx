import Link from "next/link";
import { ArrowRight, Calculator, Settings, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              Internal tool · UAH pricing
            </div>
            <h1 className="text-4xl font-semibold text-slate-900">
              3D Print Cost Calculator
            </h1>
            <p className="text-base text-slate-600">
              Estimate electricity, material, labor, and post-processing costs
              in one place. Upload STL files, track printers and materials, and
              see profit and margin instantly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/projects">
                  Open projects <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/settings">Manage settings</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calculator className="h-4 w-4 text-slate-600" /> Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Create projects, auto-save inputs, and see live COGS with
                markup or manual pricing.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4 text-slate-600" /> Directories
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Keep printers, materials, and services up to date with global
                rates.
              </CardContent>
            </Card>
            <Card className="sm:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-slate-600" /> Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600">
                Review monthly totals for revenue, cost of goods, and profit by
                date range.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
