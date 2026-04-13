"use client";

/**
 * Comp Table Preview Component
 * Bảng hiển thị danh sách comparable properties với tính năng filter, sort, pagination
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PropertyComp } from "@/types/dataset";
import {
  Database,
  Download,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreVertical,
  MapPin,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";

interface CompTablePreviewProps {
  /** Danh sách comparable properties */
  comps?: PropertyComp[];
  /** Số lượng items mỗi trang */
  pageSize?: number;
  /** Hiển thị pagination */
  showPagination?: boolean;
  /** Đang loading */
  isLoading?: boolean;
  /** Callback khi view details */
  onViewDetails?: (comp: PropertyComp) => void;
  /** Callback khi edit */
  onEdit?: (comp: PropertyComp) => void;
  /** Callback khi delete */
  onDelete?: (comp: PropertyComp) => void;
  /** Callback khi export */
  onExport?: () => void;
}

type SortField = "listingDate" | "area" | "listingPrice" | "monthlyRent" | "pricePerSqm";
type SortDirection = "asc" | "desc";

export function CompTablePreview({
  comps = [],
  pageSize = 10,
  showPagination = true,
  isLoading = false,
  onViewDetails,
  onEdit,
  onDelete,
  onExport,
}: CompTablePreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTransaction, setFilterTransaction] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("listingDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedComps, setSelectedComps] = useState<Set<string>>(new Set());

  // Filter and sort comps
  const filteredAndSortedComps = useMemo(() => {
    let filtered = comps;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (comp) =>
          comp.address.full.toLowerCase().includes(term) ||
          comp.address.district.toLowerCase().includes(term) ||
          comp.address.city.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((comp) => comp.propertyType === filterType);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((comp) => comp.status === filterStatus);
    }

    // Transaction filter
    if (filterTransaction !== "all") {
      filtered = filtered.filter((comp) => comp.transactionType === filterTransaction);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortField) {
        case "listingDate":
          aValue = new Date(a.listingDate).getTime();
          bValue = new Date(b.listingDate).getTime();
          break;
        case "area":
          aValue = a.area;
          bValue = b.area;
          break;
        case "listingPrice":
          aValue = a.listingPrice || 0;
          bValue = b.listingPrice || 0;
          break;
        case "monthlyRent":
          aValue = a.monthlyRent || 0;
          bValue = b.monthlyRent || 0;
          break;
        case "pricePerSqm":
          aValue = a.pricePerSqm;
          bValue = b.pricePerSqm;
          break;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [comps, searchTerm, filterType, filterStatus, filterTransaction, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedComps.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentComps = filteredAndSortedComps.slice(startIndex, endIndex);

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)} tr`;
    }
    return value.toLocaleString("vi-VN");
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Handle select
  const handleSelectComp = (id: string) => {
    const newSelected = new Set(selectedComps);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedComps(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedComps.size === currentComps.length) {
      setSelectedComps(new Set());
    } else {
      setSelectedComps(new Set(currentComps.map((comp) => comp.id)));
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: PropertyComp["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Đang bán/cho thuê</Badge>;
      case "sold":
        return <Badge variant="secondary">Đã bán</Badge>;
      case "rented":
        return <Badge variant="secondary">Đã cho thuê</Badge>;
      case "expired":
        return <Badge variant="outline">Hết hạn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get property type label
  const getPropertyTypeLabel = (type: PropertyComp["propertyType"]) => {
    const labels: Record<PropertyComp["propertyType"], string> = {
      apartment: "Căn hộ",
      house: "Nhà riêng",
      commercial: "Thương mại",
      land: "Đất",
      villa: "Biệt thự",
      shophouse: "Nhà phố",
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Danh Sách Comparable Properties
            </CardTitle>
            <CardDescription>
              {filteredAndSortedComps.length} comparable properties
              {selectedComps.size > 0 && ` • ${selectedComps.size} đã chọn`}
            </CardDescription>
          </div>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Xuất CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo địa chỉ, quận/huyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Loại BĐS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="apartment">Căn hộ</SelectItem>
              <SelectItem value="house">Nhà riêng</SelectItem>
              <SelectItem value="commercial">Thương mại</SelectItem>
              <SelectItem value="land">Đất</SelectItem>
              <SelectItem value="villa">Biệt thự</SelectItem>
              <SelectItem value="shophouse">Nhà phố</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang bán/thuê</SelectItem>
              <SelectItem value="sold">Đã bán</SelectItem>
              <SelectItem value="rented">Đã thuê</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
            </SelectContent>
          </Select>

          {/* Transaction Filter */}
          <Select value={filterTransaction} onValueChange={setFilterTransaction}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Giao dịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="sale">Bán</SelectItem>
              <SelectItem value="rent">Thuê</SelectItem>
              <SelectItem value="both">Cả hai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {currentComps.length === 0 ? (
          <EmptyState
            title="Không tìm thấy comparable properties"
            description="Thử thay đổi bộ lọc hoặc upload thêm dữ liệu"
            icon={Database}
          />
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedComps.size === currentComps.length}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="p-3 text-left text-sm font-medium">Địa chỉ</th>
                      <th className="p-3 text-left text-sm font-medium">Loại BĐS</th>
                      <th
                        className="p-3 text-left text-sm font-medium cursor-pointer hover:bg-muted"
                        onClick={() => handleSort("area")}
                      >
                        <div className="flex items-center gap-1">
                          Diện tích
                          {sortField === "area" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="p-3 text-left text-sm font-medium cursor-pointer hover:bg-muted"
                        onClick={() => handleSort("listingPrice")}
                      >
                        <div className="flex items-center gap-1">
                          Giá bán
                          {sortField === "listingPrice" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="p-3 text-left text-sm font-medium cursor-pointer hover:bg-muted"
                        onClick={() => handleSort("monthlyRent")}
                      >
                        <div className="flex items-center gap-1">
                          Giá thuê
                          {sortField === "monthlyRent" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="p-3 text-left text-sm font-medium">Trạng thái</th>
                      <th
                        className="p-3 text-left text-sm font-medium cursor-pointer hover:bg-muted"
                        onClick={() => handleSort("listingDate")}
                      >
                        <div className="flex items-center gap-1">
                          Ngày đăng
                          {sortField === "listingDate" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </div>
                      </th>
                      <th className="p-3 text-right text-sm font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentComps.map((comp) => (
                      <tr
                        key={comp.id}
                        className="border-t hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedComps.has(comp.id)}
                            onChange={() => handleSelectComp(comp.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {comp.address.street}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {comp.address.district}, {comp.address.city}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">{getPropertyTypeLabel(comp.propertyType)}</Badge>
                        </td>
                        <td className="p-3 text-sm">{comp.area.toFixed(0)} m²</td>
                        <td className="p-3">
                          {comp.listingPrice ? (
                            <div>
                              <p className="text-sm font-medium">
                                {formatCurrency(comp.listingPrice)} đ
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(comp.pricePerSqm)} đ/m²
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          {comp.monthlyRent ? (
                            <div>
                              <p className="text-sm font-medium">
                                {formatCurrency(comp.monthlyRent)} đ
                              </p>
                              {comp.rentPerSqm && (
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(comp.rentPerSqm)} đ/m²
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3">{getStatusBadge(comp.status)}</td>
                        <td className="p-3 text-sm">
                          {new Date(comp.listingDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            {onViewDetails && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewDetails(comp)}
                                title="Xem chi tiết"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(comp)}
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(comp)}
                                title="Xóa"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {showPagination && totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredAndSortedComps.length)} trong{" "}
                  {filteredAndSortedComps.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
