import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ActivityId = bigint;
export interface ActivityInput {
    date: bigint;
    kind: ActivityKind;
    note?: string;
    unit: string;
    cropId: CropId;
    quantity: bigint;
    amount: bigint;
}
export interface ActivityView {
    id: ActivityId;
    date: bigint;
    kind: ActivityKind;
    note?: string;
    createdAt: Timestamp;
    unit: string;
    cropId: CropId;
    quantity: bigint;
    cropName: string;
    amount: bigint;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface CropDetail {
    crop: CropView;
    lessons: Array<LessonView>;
}
export type CropId = bigint;
export interface CropInput {
    name: string;
    description: string;
    photoUrl: string;
}
export interface CropProfit {
    cost: bigint;
    cropId: CropId;
    income: bigint;
    profit: bigint;
    cropName: string;
}
export interface CropView {
    id: CropId;
    name: string;
    description: string;
    photoUrl: string;
    completedCount: bigint;
    lessonCount: bigint;
}
export interface DashboardSummary {
    hasData: boolean;
    recentActivity: Array<ActivityView>;
    activeCrops: bigint;
    upcomingTasks: bigint;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type LessonId = bigint;
export interface LessonView {
    id: LessonId;
    title: string;
    order: bigint;
    completed: boolean;
    description: string;
    cropId: CropId;
    videoUrl: string;
}
export interface ProfitSummary {
    byCrop: Array<CropProfit>;
    totalIncome: bigint;
    totalCost: bigint;
    totalProfit: bigint;
}
export interface ProgressSummary {
    totalLessons: bigint;
    crops: Array<CropView>;
    completedLessons: bigint;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum ActivityKind {
    cost = "cost",
    sale = "sale",
    harvest = "harvest"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCrop(input: CropInput): Promise<CropView>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeLesson(lessonId: LessonId): Promise<CropView | null>;
    dashboardSummary(): Promise<DashboardSummary>;
    deleteActivity(id: ActivityId): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getCrop(id: CropId): Promise<CropDetail | null>;
    isCallerAdmin(): Promise<boolean>;
    listActivities(cropFilter: CropId | null, kindFilter: ActivityKind | null): Promise<Array<ActivityView>>;
    listCrops(): Promise<Array<CropView>>;
    logActivity(input: ActivityInput): Promise<ActivityView>;
    profitSummary(): Promise<ProfitSummary>;
    progressSummary(): Promise<ProgressSummary>;
    schema(): Promise<string>;
    uncompleteLesson(lessonId: LessonId): Promise<CropView | null>;
    updateActivity(id: ActivityId, input: ActivityInput): Promise<ActivityView | null>;
}
