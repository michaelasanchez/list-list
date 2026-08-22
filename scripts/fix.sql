-- Re-index boundaries for all corrupted partitions into a valid flat sequence
WITH CorruptedPartitionIds AS (
    SELECT PartitionId
    FROM Node
    WHERE Deleted = 0
    GROUP BY PartitionId
    HAVING MIN([Left]) <> 1 
        OR MAX([Right]) <> COUNT(*) * 2 
        OR COUNT(DISTINCT [Left]) <> COUNT(*) 
        OR COUNT(DISTINCT [Right]) <> COUNT(*)
        OR SUM(CASE WHEN [Left] >= [Right] OR [Left] <= 0 OR [Right] <= 0 THEN 1 ELSE 0 END) > 0
),
OrderedNodes AS (
    SELECT 
        Id,
        ROW_NUMBER() OVER (
            PARTITION BY PartitionId 
            ORDER BY 
                CASE WHEN [Left] > 0 THEN [Left] ELSE 999999 END ASC, 
                [Right] DESC, 
                Id ASC
        ) AS Position
    FROM Node
    WHERE Deleted = 0 
      AND PartitionId IN (SELECT PartitionId FROM CorruptedPartitionIds)
)
UPDATE n
SET 
    n.[Left] = (o.Position * 2) - 1,
    n.[Right] = o.Position * 2
FROM Node n
INNER JOIN OrderedNodes o ON n.Id = o.Id;